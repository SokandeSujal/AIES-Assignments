from pathlib import Path
import bz2
import urllib.request

MODELS = {
    "shape_predictor_68_face_landmarks.dat": "https://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2",
    "dlib_face_recognition_resnet_model_v1.dat": "https://dlib.net/files/dlib_face_recognition_resnet_model_v1.dat.bz2",
}


def download_and_extract(url: str, destination: Path) -> None:
    compressed = destination.with_suffix(destination.suffix + ".bz2")
    print(f"Downloading {destination.name}...")
    urllib.request.urlretrieve(url, compressed)
    print(f"Extracting {compressed.name}...")
    with bz2.open(compressed, "rb") as src, destination.open("wb") as dst:
        dst.write(src.read())
    compressed.unlink(missing_ok=True)
    print(f"Saved {destination}")


if __name__ == "__main__":
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    for name, url in MODELS.items():
        target = models_dir / name
        if target.exists():
            print(f"Skipping {name}; file already exists.")
            continue
        download_and_extract(url, target)
