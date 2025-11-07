# OrpheusAI

OrpheusAI is a two-part application consisting of:
- A Python backend that loads a Keras model and serves predictions over an HTTP API.
- A frontend client application (see the `Frontend/` directory) for interacting with the model.

The repository also includes a list of output labels in `diseases.txt`, which can be used to map model outputs to human-readable class names.

> Note: This README is based on the current repository structure and file names. Review the “API” section against `Backend/server.py` and adjust endpoint names/payloads if they differ.

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
- `Backend/Model_v2_dev.py`: Experimental or in-progress v2 model logic.
- `Backend/v1.keras`, `Backend/v2.keras`: Serialized Keras models.
- `Backend/requirements.txt`: Python dependencies for the backend.
- `Backend/data/`: Data artifacts used by the backend or training scripts (if any).
- `Backend/logs/`: Runtime or training logs (created by the backend during operation).
- `diseases.txt`: One label per line (e.g., disease/condition names) used to map model outputs.

Useful links to the source:
- [Backend/server.py](https://github.com/kee5625/OrpheusAI/blob/main/Backend/server.py)
- [Backend/Model.py](https://github.com/kee5625/OrpheusAI/blob/main/Backend/Model.py)
- [Backend/Model_v2_dev.py](https://github.com/kee5625/OrpheusAI/blob/main/Backend/Model_v2_dev.py)
- [Backend/requirements.txt](https://github.com/kee5625/OrpheusAI/blob/main/Backend/requirements.txt)
- [diseases.txt](https://github.com/kee5625/OrpheusAI/blob/main/diseases.txt)

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

## Prerequisites

- Python: 3.9+ (3.10 recommended)
- Pip / Virtual environment tools
- Keras/TensorFlow as specified in `Backend/requirements.txt`
- Node.js (if you plan to run/build the frontend)

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

4. Configure environment (optional):
   - If your server supports it, you can define environment variables like:
     - `MODEL_PATH` (e.g., `Backend/v1.keras` or `Backend/v2.keras`)
     - `PORT` (e.g., `8000` or `5000`)
     - `LOG_DIR` (e.g., `Backend/logs`)
   - Check `server.py` for the exact configuration options.

---

## Run (Backend)

There are two common ways to run the backend:

- Direct Python execution:
  ```bash
  cd Backend
  python server.py
  ```

- If the server is built with FastAPI and exposes an `app` object, you can also run:
  ```bash
  uvicorn server:app --host 0.0.0.0 --port 8000 --reload
  ```

Check the output in the terminal for the actual host/port and any hints printed by `server.py`.

---

## API

Open `Backend/server.py` to see the exact routes, HTTP methods, and payload schemas. Typical patterns include:

- Health check:
  - `GET /health` → returns a simple JSON indicating the server is running.

- Prediction endpoint:
  - `POST /predict` → accepts a JSON payload with the features/inputs the model expects, returns predicted label(s) and/or probabilities.
  - The server likely reads `diseases.txt` to map prediction indices to label names.

Example request (replace with the actual schema in `server.py`):
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
        "inputs": [/* your model inputs here */]
      }'
```

Example response:
```json
{
  "label": "ExampleCondition",
  "score": 0.97,
  "top_k": [
    {"label": "ExampleCondition", "score": 0.97},
    {"label": "AnotherCondition", "score": 0.02}
  ]
}
```

---

## Using diseases.txt

- `diseases.txt` typically contains one label per line:
  ```
  ConditionA
  ConditionB
  ConditionC
  ```
- After model inference returns logits or probabilities, the server maps the predicted index to a label from this list.
- If you update the model to predict a different set/order of labels, update `diseases.txt` accordingly.

---

## Model development

- `Model.py` contains the primary model loading/inference utilities. If you’re customizing preprocessing or postprocessing, start here.
- `Model_v2_dev.py` is an experimental v2 version. Use it to iterate on new architectures or preprocessing flows.
- Training data and scripts:
  - If training utilities are included, they will likely read/write from `Backend/data/` and log to `Backend/logs/`.
  - Adjust paths and parameters in the model scripts as needed.

---

## Frontend

- The `Frontend/` directory contains the client application UI.
- Typical commands (adjust to the actual frontend framework):
  ```bash
  cd Frontend
  # Install dependencies
  npm install
  # Start dev server
  npm run dev
  # Build for production
  npm run build
  ```
- Configure the frontend to point at the backend API host/port (often via an environment variable or config file).

---

## Project roadmap

- Maintain stable v1 model (`v1.keras`).
- Iterate on experimental v2 (`Model_v2_dev.py` / `v2.keras`).
- Add/extend API endpoints and validation.
- Enhance logging and observability in `Backend/logs/`.
- Document the exact input schema and add example payloads.

---

## Troubleshooting

- Missing dependencies: Reinstall with `pip install -r Backend/requirements.txt`.
- Model loading errors:
  - Verify `MODEL_PATH` and that the `.keras` file exists and is readable.
  - Ensure Keras/TensorFlow versions are compatible.
- Label mismatches:
  - Ensure `diseases.txt` label order matches the model’s output order.

---

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit changes with clear messages.
4. Open a pull request describing your changes.

---

## License

Add your license of choice here (e.g., MIT, Apache-2.0). If a license file exists, reference it.

---
