# OrpheusAI

OrpheusAI is an intelligent diagnostic assistant designed to support dermatological analysis using deep learning. The system leverages a custom-built convolutional neural network (CNN) trained and tested on publicly available patient image data from DermNet.

The MVP implementation supports 10 disease classes, using a Keras-based CNN model optimized for image classification.


Architecture:

Backend: A Python server that loads the trained Keras model and serves predictions through a RESTful HTTP API.
Frontend: A responsive client interface that allows users to upload images and receive real-time diagnostic insights.

The repository also includes a diseases.txt file that maps the model’s numerical outputs to human-readable class names, enhancing interpretability and ease of integration.

---

## Repository structure

```
.
├─ .gitattributes
├─ README.md
├─ diseases.txt
├─ Backend/
│  ├─ Model.py
│  ├─ Model_v2_dev.py
│  ├─ requirements.txt
│  ├─ server.py
│  ├─ v1.keras
│  ├─ v2.keras
│  ├─ data/
│  └─ logs/
└─ Frontend/
```

Key components:
- `Backend/server.py`: Web server exposing model inference endpoints.
- `Backend/Model.py`: Model loading/inference utilities for the current model.
- `Backend/Model_v2_dev.py`: in-progress v2 model logic.
- `Backend/v1.keras`, `Backend/v2.keras`: Serialized Keras models.
- `Backend/requirements.txt`: Python dependencies for the backend.
- `Backend/data/`: Data artifacts used by the backend or training scripts (if any).
- `Backend/logs/`: Runtime or training logs (created by the backend during operation).
- `diseases.txt`: One label per line (e.g., disease/condition names) used to map model outputs.

---

## How it works

1. Model assets
   - The backend uses a Keras model saved to disk (`v1.keras` or `v2.keras`).
   - `diseases.txt` contains the output label names (one per line). After inference, the backend maps raw model outputs (e.g., indices or probabilities) to these labels.

2. Backend server
   - `server.py` starts an HTTP API (commonly using Flask or FastAPI).
   - On startup, it loads the selected Keras model from `Backend/` and prepares it for inference.
   - Incoming requests are parsed, data is preprocessed, inference is performed, and results are returned as JSON.
   - Logs may be written to `Backend/logs/`.

3. Frontend client
   - The `Frontend/` directory holds the client UI (framework details depend on the files in that directory).
   - The frontend sends requests to the backend’s endpoints and displays model results.


---

## Setup (Backend)

1. Create and activate a virtual environment:
   ```bash
   cd Backend
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. Ensure the model files exist:
   - `v1.keras` or `v2.keras` should be present in `Backend/`. (They are included in this repository.)
   - Ensure `diseases.txt` is at the project root and readable by the server.

---

## Run (Backend)

There are two common ways to run the backend:

- Direct Python execution:
  ```bash
  cd Backend
  python server.py
  ```

---

## Model development

- `Model.py` contains the primary model loading/inference utilities. If you’re customizing preprocessing or postprocessing, start here.
- `Model_v2_dev.py` is an experimental v2 version. Use it to iterate on new architectures or preprocessing flows.
- Training data and scripts:
  - If training utilities are included, they will likely read/write from `Backend/data/` and log to `Backend/logs/`.
  - Adjust paths and parameters in the model scripts as needed.




## Troubleshooting

- Missing dependencies: Reinstall with `pip install -r Backend/requirements.txt`.
- Model loading errors:
  - Verify `MODEL_PATH` and that the `.keras` file exists and is readable.
  - Ensure Keras/TensorFlow versions are compatible.
- Label mismatches:
  - Ensure `diseases.txt` label order matches the model’s output order.

---
