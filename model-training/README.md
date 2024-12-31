# Garment Measurement Model Training

This directory contains scripts to train a TensorFlow model for automatic garment measurements.

## Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install requirements:
```bash
pip install -r requirements.txt
```

## Prepare Your Dataset

1. Create the following directory structure:
```
data/garments/
├── raw/                    # Put your garment images here
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
└── measurements.json       # Create this file with measurements
```

2. Format your measurements.json file like this:
```json
{
  "image1": {
    "chest": 40.5,
    "shoulders": 16.5,
    "length": 28.0,
    "sleeves": 24.5,
    "waist": 38.0
  },
  "image2": {
    ...
  }
}
```

3. Run the dataset preparation script:
```bash
python prepare_dataset.py
```

## Training the Model

1. Run the training script:
```bash
python train_model.py
```

The script will:
- Split your dataset into train/validation/test sets
- Train the model using transfer learning with MobileNetV2
- Save checkpoints during training
- Convert the final model to TensorFlow.js format

## Using the Trained Model

After training, you'll find:
- `model_tfjs/` directory with the TensorFlow.js model
- `final_model.h5` with the Keras model
- Training checkpoints in `checkpoints/`

Copy the contents of `model_tfjs/` to your web application's public directory:
```bash
cp -r model_tfjs/* ../client/public/models/garment_measurement/
```

## Best Practices for Training Data

For best results:
1. Use high-quality images with good lighting
2. Photograph garments laid flat on a contrasting background
3. Ensure all edges of the garment are visible
4. Take photos directly above the garment
5. Include a variety of garment sizes and styles
6. Measure garments consistently using the same method
7. Use accurate measurements in inches

## Model Architecture

The model uses MobileNetV2 as a base with transfer learning:
1. Pre-trained MobileNetV2 base (frozen)
2. Global Average Pooling
3. Dense layers for measurement prediction
4. Output layer with 5 measurements

## Troubleshooting

1. If you get memory errors:
   - Reduce batch_size in train_model.py
   - Reduce image resolution (default is 224x224)

2. If the model isn't accurate:
   - Add more training data
   - Increase training epochs
   - Adjust the learning rate
   - Try unfreezing more layers in the base model
