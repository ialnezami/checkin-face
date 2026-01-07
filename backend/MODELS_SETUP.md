# Face Recognition Models Setup

The face recognition system requires pre-trained models from face-api.js. Follow these steps to set up the models:

## Download Models

1. Create the models directory:
```bash
mkdir -p models
cd models
```

2. Download the required models from the face-api.js repository:

```bash
# SSD Mobilenet V1 (for face detection)
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard1

# Face Landmark 68 (for face landmarks)
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1

# Face Recognition (for face descriptors)
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
```

## Alternative: Use Script

You can also use this script to download all models:

```bash
#!/bin/bash
MODELS_DIR="./models"
mkdir -p $MODELS_DIR
cd $MODELS_DIR

BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

# Download SSD Mobilenet V1
wget $BASE_URL/ssd_mobilenetv1_model-weights_manifest.json
wget $BASE_URL/ssd_mobilenetv1_model-shard1

# Download Face Landmark 68
wget $BASE_URL/face_landmark_68_model-weights_manifest.json
wget $BASE_URL/face_landmark_68_model-shard1

# Download Face Recognition
wget $BASE_URL/face_recognition_model-weights_manifest.json
wget $BASE_URL/face_recognition_model-shard1
wget $BASE_URL/face_recognition_model-shard2

echo "Models downloaded successfully!"
```

## Verify Models

After downloading, your `models` directory should contain:
- `ssd_mobilenetv1_model-weights_manifest.json`
- `ssd_mobilenetv1_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`

## Docker Setup

If running in Docker, you'll need to copy the models into the container or mount them as a volume. Update `docker-compose.yml` to include:

```yaml
volumes:
  - ./backend/models:/app/models
```

## Notes

- Models are approximately 5-10 MB total
- Models are loaded once when the service starts
- First face recognition request may take longer as models are loaded
- Ensure the `FACE_RECOGNITION_MODEL_PATH` environment variable points to the correct directory

