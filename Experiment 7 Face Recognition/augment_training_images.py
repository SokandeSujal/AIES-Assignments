import argparse
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

import face_recognition_api


VALID_EXTENSIONS = {".jpg", ".jpeg", ".png"}
GENERATED_PREFIX = "aug_"


def parse_args():
    parser = argparse.ArgumentParser(
        description="Create and save augmented face images inside each person's training folder."
    )
    parser.add_argument(
        "--training-dir",
        default="training-images",
        help="Directory containing one subfolder per person.",
    )
    parser.add_argument(
        "--per-image",
        type=int,
        default=10,
        help="How many augmented images to create for each original image.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for repeatable augmentation choices.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Allow overwriting generated file names if they already exist.",
    )
    return parser.parse_args()


def iter_person_dirs(training_dir):
    return sorted([path for path in training_dir.iterdir() if path.is_dir()])


def iter_original_images(person_dir):
    images = []
    for path in sorted(person_dir.iterdir()):
        if path.is_file() and path.suffix.lower() in VALID_EXTENSIONS and not path.stem.startswith(GENERATED_PREFIX):
            images.append(path)
    return images


def next_output_path(person_dir, source_stem, counter, overwrite):
    while True:
        candidate = person_dir / f"{GENERATED_PREFIX}{source_stem}_{counter:03d}.jpg"
        if overwrite or not candidate.exists():
            return candidate
        counter += 1


def apply_random_augmentation(image, rng):
    working = image.convert("RGB")

    if rng.random() < 0.5:
        working = ImageOps.mirror(working)

    rotation = rng.uniform(-10, 10)
    working = working.rotate(rotation, resample=Image.Resampling.BICUBIC, expand=False, fillcolor=(0, 0, 0))

    width, height = working.size
    crop_ratio = rng.uniform(0.92, 0.98)
    crop_w = max(1, int(width * crop_ratio))
    crop_h = max(1, int(height * crop_ratio))
    max_x = max(0, width - crop_w)
    max_y = max(0, height - crop_h)
    left = rng.randint(0, max_x) if max_x else 0
    top = rng.randint(0, max_y) if max_y else 0
    working = working.crop((left, top, left + crop_w, top + crop_h)).resize(
        (width, height), Image.Resampling.LANCZOS
    )

    working = ImageEnhance.Brightness(working).enhance(rng.uniform(0.88, 1.12))
    working = ImageEnhance.Contrast(working).enhance(rng.uniform(0.9, 1.15))
    working = ImageEnhance.Color(working).enhance(rng.uniform(0.92, 1.08))
    working = ImageEnhance.Sharpness(working).enhance(rng.uniform(0.95, 1.1))

    if rng.random() < 0.3:
        working = working.filter(ImageFilter.GaussianBlur(radius=rng.uniform(0.15, 0.6)))

    if rng.random() < 0.35:
        noisy = np.asarray(working).astype(np.int16)
        noise = np.random.normal(0, rng.uniform(2, 8), noisy.shape)
        noisy = np.clip(noisy + noise, 0, 255).astype(np.uint8)
        working = Image.fromarray(noisy, mode="RGB")

    return working


def has_face(image_path):
    image = face_recognition_api.load_image_file(str(image_path))
    return len(face_recognition_api.face_locations(image)) >= 1


def augment_person_dir(person_dir, per_image, rng, overwrite):
    originals = iter_original_images(person_dir)
    if not originals:
        print(f"[WARN] No original images found in {person_dir}")
        return 0

    saved_count = 0
    for image_path in originals:
        print(f"[INFO] Augmenting {image_path}")
        source_stem = image_path.stem.replace(" ", "_")
        counter = 1

        with Image.open(image_path) as source_image:
            for _ in range(per_image):
                generated = None
                for _attempt in range(12):
                    candidate_image = apply_random_augmentation(source_image, rng)
                    output_path = next_output_path(person_dir, source_stem, counter, overwrite)
                    candidate_image.save(output_path, format="JPEG", quality=95)

                    if has_face(output_path):
                        print(f"[OK] Saved {output_path.name}")
                        saved_count += 1
                        counter += 1
                        generated = output_path
                        break

                    output_path.unlink(missing_ok=True)

                if generated is None:
                    print(f"[WARN] Could not produce a valid face augmentation for {image_path.name}")

    return saved_count


def main():
    args = parse_args()
    rng = random.Random(args.seed)
    np.random.seed(args.seed)

    training_dir = Path(args.training_dir)
    if not training_dir.exists():
        raise FileNotFoundError(f"Training directory '{training_dir}' does not exist.")

    total_saved = 0
    person_dirs = iter_person_dirs(training_dir)
    if not person_dirs:
        raise RuntimeError(f"No person folders were found inside '{training_dir}'.")

    for person_dir in person_dirs:
        total_saved += augment_person_dir(person_dir, args.per_image, rng, args.overwrite)

    print(f"[DONE] Saved {total_saved} augmented images across {len(person_dirs)} folders.")


if __name__ == "__main__":
    main()
