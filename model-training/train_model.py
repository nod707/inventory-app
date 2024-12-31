import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
import tensorflowjs as tfjs

class GarmentDataGenerator(tf.keras.utils.Sequence):
    def __init__(self, dataset_file, batch_size=32, target_size=(224, 224)):
        with open(dataset_file, 'r') as f:
            self.dataset = json.load(f)
        self.batch_size = batch_size
        self.target_size = target_size
        self.indices = np.arange(len(self.dataset))
        
    def __len__(self):
        return int(np.ceil(len(self.dataset) / self.batch_size))
    
    def __getitem__(self, idx):
        batch_indices = self.indices[idx * self.batch_size:(idx + 1) * self.batch_size]
        batch_entries = [self.dataset[i] for i in batch_indices]
        
        # Prepare batch data
        X = np.zeros((len(batch_entries),) + self.target_size + (3,))
        y = np.zeros((len(batch_entries), 5))  # 5 measurements
        
        for i, entry in enumerate(batch_entries):
            # Load and preprocess image
            img = tf.keras.preprocessing.image.load_img(
                entry['image_path'],
                target_size=self.target_size
            )
            X[i] = tf.keras.preprocessing.image.img_to_array(img) / 255.0
            
            # Prepare measurements
            measurements = entry['measurements']
            y[i] = [
                measurements['chest'],
                measurements['shoulders'],
                measurements['length'],
                measurements['sleeves'],
                measurements['waist']
            ]
        
        return X, y
    
    def on_epoch_end(self):
        np.random.shuffle(self.indices)

def create_model(input_shape=(224, 224, 3)):
    """Create the model architecture"""
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze the base model
    base_model.trainable = False
    
    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(64, activation='relu'),
        layers.Dense(5, activation='linear')  # 5 measurements
    ])
    
    return model

def train_model():
    """Train the garment measurement model"""
    # Create data generators
    train_gen = GarmentDataGenerator('data/garments/train_dataset.json', batch_size=32)
    val_gen = GarmentDataGenerator('data/garments/val_dataset.json', batch_size=32)
    
    # Create and compile model
    model = create_model()
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )
    
    # Callbacks
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            'checkpoints/model_{epoch:02d}.h5',
            save_best_only=True,
            monitor='val_loss'
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=0.00001
        )
    ]
    
    # Train the model
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=50,
        callbacks=callbacks
    )
    
    # Save the model for TensorFlow.js
    tfjs.converters.save_keras_model(model, 'model_tfjs')
    
    return history, model

if __name__ == '__main__':
    # Create checkpoint directory
    os.makedirs('checkpoints', exist_ok=True)
    
    # Train the model
    history, model = train_model()
    
    # Save the final model
    model.save('final_model.h5')
