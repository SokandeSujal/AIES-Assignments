# Experiment 6 and Experiment 7 Notes

This document explains both experiments from the actual parent project structure:

- `Exp 6 Chatbot`
- `Experiment 7 Face Recognition`

So the correct mapping is:

- Experiment 6: AI chatbot system
- Experiment 7: face recognition system

## 1. Overall Project Structure

The root folder contains two separate but related AI experiments:

1. `Exp 6 Chatbot`
2. `Experiment 7 Face Recognition`

Experiment 6 is a conversational AI application with three modes.
Experiment 7 is a computer vision application for recognizing faces from images and webcam input.

These are different AI problem types:

- Experiment 6: natural language processing and agent workflow
- Experiment 7: computer vision and face recognition

## 2. Experiment 6: Chatbot

### 2.1 Aim

The goal of Experiment 6 is to build an interactive AI chatbot system with:

- general AI chat,
- a grounded personal avatar chatbot,
- a multi-agent debate workflow.

This is not a rule-based chatbot. It is an LLM-powered application with a frontend, backend, prompt system, and agent orchestration.

### 2.2 Tech Stack

From the codebase, the stack is:

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: FastAPI
- LLM access: OpenAI Python SDK
- Multi-agent orchestration: LangGraph
- Environment management: `python-dotenv`
- Voice output: browser `SpeechSynthesis` API

### 2.3 Main Files

- `Exp 6 Chatbot/backend/main.py`: FastAPI backend and API routes
- `Exp 6 Chatbot/backend/langgraph_arena.py`: multi-agent debate graph
- `Exp 6 Chatbot/backend/prompts.py`: system prompts and avatar grounding logic
- `Exp 6 Chatbot/backend/data/profile.md`: source profile for avatar mode
- `Exp 6 Chatbot/frontend/app/page.tsx`: main UI shell
- `Exp 6 Chatbot/frontend/app/api/chat/route.ts`: frontend API bridge
- `Exp 6 Chatbot/frontend/app/components/ChatInterface.tsx`: chat UI
- `Exp 6 Chatbot/frontend/app/components/ArenaPanel.tsx`: arena UI
- `Exp 6 Chatbot/frontend/app/components/ModeSelector.tsx`: mode selection UI

### 2.4 Main Functional Modes

The chatbot has three modes:

#### Ask AI

This is standard general-purpose chat.

The backend route is `/api/ask`.
It uses a general system prompt from `backend/prompts.py` and sends the conversation to the OpenAI model.

#### Ask My Avatar

This is a grounded chatbot that answers as Sujal.

The backend route is `/api/avatar`.
It builds a system prompt using the contents of `backend/data/profile.md`.

Important viva point:

- this is not model fine-tuning,
- this is prompt grounding using local profile data,
- the model is instructed to answer only from that provided profile context.

#### Agent Arena

This is the most agentic part of Experiment 6.

The backend route is `/api/arena`.
It runs a 3-step LangGraph workflow:

1. Thinker
2. Critic
3. Judge

Each agent has a different role and prompt.

### 2.5 Backend Architecture

The backend in `backend/main.py` uses FastAPI and defines:

- `/api/health`
- `/api/ask`
- `/api/avatar`
- `/api/arena`

There are two main request types:

- `ChatRequest`
- `ArenaRequest`

The backend loads:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

The default model from the code is:

- `gpt-4o-mini`

So the chatbot does not use a locally trained language model. It calls a hosted OpenAI model through API.

### 2.6 How General Chat Works

In `generate_chat_response()` the backend:

1. validates the API key,
2. builds a message list,
3. inserts the system prompt,
4. appends recent conversation history,
5. appends the latest user message,
6. sends everything to `client.chat.completions.create(...)`,
7. returns the assistant response.

So the memory here is short-term conversational memory from recent messages, not long-term database memory.

### 2.7 How Avatar Mode Works

Avatar mode uses `build_avatar_system_prompt()` from `backend/prompts.py`.

That function:

1. reads `backend/data/profile.md`,
2. injects the profile into the system prompt,
3. tells the model to answer as Sujal,
4. prevents unsupported fabrication by instruction.

This means the avatar is:

- grounded,
- first-person,
- profile-based,
- not hardcoded with static replies.

Important viva distinction:

- prompt engineering: giving instructions and context dynamically
- fine-tuning: retraining the model weights

This project uses prompt engineering, not fine-tuning.

### 2.8 Agent Arena Architecture

`backend/langgraph_arena.py` defines a LangGraph `StateGraph`.

The state contains:

- `topic`
- `thinker`
- `critic`
- `judge`

The workflow is:

1. `START -> thinker`
2. `thinker -> critic`
3. `critic -> judge`
4. `judge -> END`

So this is a sequential multi-agent reasoning pipeline.

#### Thinker

The Thinker creates the first strong answer on the given debate topic.

#### Critic

The Critic reads the Thinker output and challenges assumptions, gaps, and weak logic.

#### Judge

The Judge reads both the Thinker and Critic outputs and produces the final synthesis.

Important viva point:

- this is not three independent chats,
- it is a controlled graph-based agent workflow,
- later nodes consume outputs from previous nodes.

### 2.9 Why LangGraph Is Used

LangGraph is used because it is designed for structured multi-step LLM workflows.

Benefits:

- clear state passing,
- modular agent design,
- deterministic graph structure,
- easy extension to more nodes later.

Without LangGraph, the same behavior would require manual orchestration code.

### 2.10 Frontend Architecture

The frontend is built with Next.js and React.

Main UI responsibilities:

- selecting chatbot mode,
- sending prompts,
- showing chat history,
- calling the backend,
- displaying arena results,
- exporting chat,
- reading responses aloud in browser speech synthesis.

`frontend/app/page.tsx` is the main page.
It stores:

- the current mode,
- chat sessions,
- arena results,
- loading state.

### 2.11 Frontend API Flow

The frontend does not call OpenAI directly.
Instead:

1. the React UI sends data to `frontend/app/api/chat/route.ts`,
2. that route forwards the request to FastAPI,
3. FastAPI talks to OpenAI,
4. the result comes back to the frontend.

This is good architecture because:

- the API key stays on the backend,
- the browser does not expose secrets,
- the backend can control prompts and validation.

### 2.12 Speech Feature

The app uses the browser `SpeechSynthesis` API.

This means:

- voice output happens client-side,
- no separate paid text-to-speech API is required,
- the browser reads the generated text aloud.

### 2.13 Is Experiment 6 Training a Chatbot Model?

No.

This is very important in viva.

The app does not train an LLM from scratch.
It does not fine-tune OpenAI model weights.

It uses:

- hosted LLM inference,
- prompt engineering,
- grounded context injection,
- graph-based orchestration.

So the intelligence comes from:

- the underlying OpenAI model,
- the system prompts,
- the input history,
- the LangGraph workflow.

### 2.14 What Makes Experiment 6 Interesting Technically

The interesting engineering parts are:

- mode-based conversation behavior,
- prompt-grounded digital avatar,
- multi-agent debate chain,
- clean separation of frontend and backend,
- API-based LLM orchestration.

So if faculty asks, "What is the AI contribution here?", a strong answer is:

"The system combines prompt engineering, persona grounding, and LangGraph-based agent orchestration on top of a hosted LLM, then exposes it through a full-stack web interface."

### 2.15 Viva Questions for Experiment 6

#### What is the difference between a normal chatbot and this chatbot?

A normal chatbot may use a single prompt-response pattern.
This system supports three behaviors: general assistance, grounded avatar response, and multi-agent reasoning.

#### Is this rule-based?

No. It is LLM-based.

#### Did you train the model?

No. We used an API-based pretrained OpenAI model.

#### What is the role of prompts?

Prompts control system behavior, persona, tone, and reasoning role.

#### What is the role of LangGraph?

LangGraph manages the structured Thinker-Critic-Judge workflow with explicit state transitions.

#### Is avatar mode retrieval-augmented generation?

Not exactly. It is closer to direct prompt grounding from a local profile file. There is no vector database or retrieval pipeline in this code.

#### Why keep the API call on the backend?

For security, prompt control, and architecture cleanliness.

## 3. Experiment 7: Face Recognition

### 3.1 Aim

The goal of Experiment 7 is to recognize known people from:

- stored images,
- live webcam frames.

The system builds a dataset of labeled faces, generates face encodings, trains a classifier, and performs recognition on new inputs.

### 3.2 Main Libraries

- `dlib`: face detection, landmark estimation, face embedding generation
- `numpy`: numerical arrays
- `pandas`: CSV handling
- `scikit-learn`: label encoding and KNN classification
- `Pillow`: image loading and resizing
- `OpenCV`: webcam input and frame display
- `pickle`: storing trained objects

### 3.3 Main Files

- `Experiment 7 Face Recognition/face_recognition_api.py`: low-level face processing
- `Experiment 7 Face Recognition/create_encodings.py`: dataset encoding creation
- `Experiment 7 Face Recognition/train.py`: classifier training
- `Experiment 7 Face Recognition/predict.py`: prediction on test images
- `Experiment 7 Face Recognition/webcam.py`: real-time recognition
- `Experiment 7 Face Recognition/augment_training_images.py`: augmentation pipeline

### 3.4 Pipeline

The pipeline is:

1. put images in `training-images/<person_name>/`
2. optionally augment them
3. detect face
4. detect landmarks
5. generate 128D face encoding
6. store encodings in CSV
7. train KNN classifier
8. predict identity from new image or webcam frame

### 3.5 Which Models Are Used?

This experiment uses a multi-stage vision pipeline.

#### Face Detector

`dlib.get_frontal_face_detector()`

This is a classical HOG + linear classifier + image pyramid + sliding window detector.

#### Landmark Detector

`models/shape_predictor_68_face_landmarks.dat`

This predicts 68 landmark points on the face.

It is based on dlib's implementation of Kazemi and Sullivan's facial alignment method using regression trees.

#### Face Recognition Model

`models/dlib_face_recognition_resnet_model_v1.dat`

This is the main deep model.
It generates a 128-dimensional embedding for each face.

Important viva point:

- this model is pretrained,
- this project does not fine-tune it,
- it is used as a feature extractor.

### 3.6 What Is Meant by Encoding?

An encoding is a 128-dimensional numeric representation of a face.

If two faces belong to the same person, their vectors should be close in feature space.
If they belong to different people, their vectors should be farther apart.

This is better than raw pixel comparison because embeddings capture identity-related structure more robustly than raw images.

### 3.7 How Encodings Are Generated

Inside `face_recognition_api.py`:

1. image is loaded,
2. face is detected,
3. landmarks are extracted,
4. `compute_face_descriptor()` generates the 128D vector.

Inside `create_encodings.py`:

1. person folders are read,
2. folder names become class labels,
3. each image is encoded,
4. the encoding plus label is stored in `encoded-images-data.csv`.

### 3.8 Labels and Class Mapping

The names of folders inside `training-images` become class names.

Example:

- `Sujal`
- `Sarthak`
- `Suhas Joshi Sir`

`LabelEncoder` converts these names to integer labels.

That mapping is stored in `labels.pkl`.

### 3.9 Classifier Used

The classifier in `train.py` is:

- `KNeighborsClassifier(n_neighbors=3, algorithm='ball_tree', weights='distance')`

Meaning:

- `n_neighbors=3`: looks at the 3 nearest examples
- `weights='distance'`: nearer neighbors matter more
- `algorithm='ball_tree'`: faster nearest-neighbor search

Important viva point:

- KNN is trained locally
- the deep embedding model is not retrained locally

### 3.10 Why KNN Is Used

KNN is suitable because the deep model already converts faces into a strong embedding space.

So recognition becomes:

- generate embedding,
- find nearest known embeddings,
- choose the most likely label.

Advantages:

- simple,
- effective,
- fast to train,
- suitable for small datasets.

### 3.11 Thresholding and Unknown Faces

The project does not only classify.
It also checks distance to nearest neighbor.

If distance is above a threshold such as `0.5`, the system marks the face as `Unknown`.

This is important because otherwise every face would be forced into one known class.

### 3.12 Architecture of the Main Recognition Model

The main face recognition model is dlib's pretrained ResNet-style embedding network.

At a high level it contains:

- initial convolution
- max pooling
- residual blocks
- global average pooling
- final 128-dimensional projection

It is commonly referred to as a 29-layer ResNet face embedding model.

Historically, dlib reported this model near state-of-the-art on LFW for its release period.

### 3.13 Role of OpenCV in Experiment 7

OpenCV is used mainly in `webcam.py` for:

- webcam capture,
- frame reading,
- frame resizing,
- drawing rectangles,
- putting names on frames,
- displaying the live window.

So OpenCV handles video I/O and visualization.
dlib handles actual face analysis.

### 3.14 Why Resize and Skip Frames

In webcam mode:

- frames are resized to one-fourth size for faster inference
- alternate frames are skipped to improve responsiveness

These are runtime optimizations, not changes to the actual model.

### 3.15 Role of Data Augmentation

`augment_training_images.py` creates saved variants of original face images.

Examples:

- horizontal flip
- slight rotation
- brightness change
- crop/zoom
- blur
- noise

Why this is useful:

- improves variation,
- reduces overfitting to one photo,
- helps when only a few images per person are available.

Important viva point:

- augmentation does not create new identities,
- it only improves variation of the same identity.

### 3.16 Did We Fine-Tune the Deep Face Model?

No.

This experiment does not fine-tune the dlib face recognition network.

It uses:

1. pretrained detection and embedding models
2. local encoding generation
3. KNN classifier training

So this is frozen-feature transfer learning, not end-to-end deep retraining.

### 3.17 Viva Questions for Experiment 7

#### What is face detection?

Finding where a face exists in an image.

#### What is face recognition?

Identifying whose face it is.

#### What are landmarks?

Facial key points such as eye corners, lips, nose, and jaw points.

#### What is an encoding?

A 128-dimensional vector representation of a face.

#### Is KNN the only model here?

No. KNN is only the top-level classifier. The deep dlib model generates the important face embeddings.

#### Did you train a CNN?

No. We used a pretrained deep model and trained only a KNN classifier.

#### Why use thresholding?

To reject unknown faces rather than always forcing a prediction.

## 4. Key Difference Between Experiment 6 and Experiment 7

Experiment 6 and Experiment 7 solve different AI tasks.

### Experiment 6

- domain: conversational AI
- input: text
- output: generated text
- main AI engine: hosted LLM
- architecture: frontend + FastAPI + OpenAI API + LangGraph

### Experiment 7

- domain: computer vision
- input: face image or video frame
- output: person identity
- main AI engine: dlib face recognition pipeline + KNN
- architecture: image preprocessing + face embedding + classifier

So if faculty asks why these two experiments are in the same folder, the best answer is:

"Both are AI applications, but Experiment 6 demonstrates conversational intelligence and multi-agent orchestration, while Experiment 7 demonstrates computer vision and face recognition."

## 5. Short Summary for Faculty

Experiment 6 is a full-stack AI chatbot system. It uses a Next.js frontend, FastAPI backend, OpenAI API for language generation, prompt-grounded avatar mode, and a LangGraph-based Thinker-Critic-Judge multi-agent workflow.

Experiment 7 is a face recognition system. It uses dlib for face detection, facial landmarks, and deep face embeddings, then trains a KNN classifier on those embeddings. It supports both image-based and live webcam-based recognition, with OpenCV handling the webcam interface.

## 6. References

Primary references for Experiment 6:

- FastAPI documentation: https://fastapi.tiangolo.com/
- Next.js documentation: https://nextjs.org/docs
- LangGraph documentation: https://langchain-ai.github.io/langgraph/
- OpenAI Python SDK documentation: https://github.com/openai/openai-python

Primary references for Experiment 7:

- dlib face recognition example: https://dlib.net/face_recognition.py.html
- dlib face landmark example: https://dlib.net/face_landmark_detection.py.html
- dlib DNN face recognition example: https://dlib.net/dnn_face_recognition_ex.cpp.html
- scikit-learn KNeighborsClassifier docs: https://scikit-learn.org/stable/modules/generated/sklearn.neighbors.KNeighborsClassifier
- OpenCV VideoCapture docs: https://docs.opencv.org/3.4/d8/dfe/classcv_1_1VideoCapture.html
