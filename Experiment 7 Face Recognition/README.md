# Experiment 7 - Face Recognition

A face recognition system that supports both image-based prediction and live webcam recognition. The project uses dlib for detection, landmarks, and deep face embeddings, then trains a KNN classifier on top of those embeddings.

## System Pipeline

```mermaid
flowchart LR
    A[Training Images] --> B[Face Detection]
    B --> C[Landmark Detection]
    C --> D[128D Face Encoding]
    D --> E[encoded-images-data.csv]
    E --> F[KNN Training]
    F --> G[classifier.pkl]
    G --> H[Prediction on image or webcam]
```

## Webcam Inference Flow

```mermaid
flowchart LR
    A[OpenCV Webcam Frame] --> B[Resize Frame]
    B --> C[Detect Faces]
    C --> D[Generate Encodings]
    D --> E[KNN Prediction]
    E --> F[Threshold Check]
    F --> G[Recognized Name or Unknown]
    G --> H[Draw Bounding Box and Label]
```

## Features

- Face recognition from stored test images
- Live webcam recognition
- Saved data augmentation for low-image datasets
- 128-dimensional deep face encodings
- KNN-based identity classification
- Unknown-face rejection through a distance threshold

## Tech Stack

- Python
- dlib
- NumPy
- pandas
- scikit-learn
- Pillow
- OpenCV

## Project Structure

```text
Experiment 7 Face Recognition/
|- demo-python-files/
|- models/
|- augment_training_images.py
|- create_encodings.py
|- download_models.py
|- face_recognition_api.py
|- predict.py
|- requirements.txt
|- run_pipeline.ps1
|- train.py
`- webcam.py
```

## Main Models Used

### Face Detector

Uses `dlib.get_frontal_face_detector()`.
This is a HOG + linear classifier + image pyramid + sliding window detector.

### Landmark Model

Uses `models/shape_predictor_68_face_landmarks.dat`.
This predicts 68 facial landmark points.

### Face Recognition Model

Uses `models/dlib_face_recognition_resnet_model_v1.dat`.
This is the pretrained deep model that generates a 128-dimensional face embedding.

### Classifier

Uses `KNeighborsClassifier` from scikit-learn with distance-based voting.

## Download Model Files

The large dlib model binaries are not committed in this assignment repo to keep the repository pushable and clean.

Download them with:

```powershell
python .\download_models.py
```

This script fetches and extracts:

- `shape_predictor_68_face_landmarks.dat`
- `dlib_face_recognition_resnet_model_v1.dat`

## Training Workflow

1. Add images inside `training-images/<person_name>/`
2. Optionally run augmentation to create more saved variants
3. Run `create_encodings.py`
4. Run `train.py`
5. Use `predict.py` or `webcam.py` for inference

The included `run_pipeline.ps1` automates environment setup, augmentation, encoding generation, and classifier training.

## Run Locally

### Download models first

```powershell
python .\download_models.py
```

### One-command setup and training

```powershell
./run_pipeline.ps1
```

### Predict on test images

```powershell
.\.venv\Scripts\python.exe .\predict.py
```

### Run webcam mode

```powershell
.\.venv\Scripts\python.exe .\webcam.py
```

## Important Notes

- The deep dlib model is pretrained and frozen.
- This project does not fine-tune the face recognition network.
- Training in this repository means generating embeddings and training the KNN classifier.
- `training-images/`, generated CSV files, and classifier outputs are intentionally excluded from this submission repo.
- Personal face data should not be committed to a public repository.

## Viva Highlights

- Face detection is not the same as face recognition.
- Landmarks are geometric key points; encodings are 128D identity descriptors.
- KNN is only the top-level classifier; the deep dlib model provides the important features.
- OpenCV handles webcam I/O and drawing; dlib handles the face analytics.
