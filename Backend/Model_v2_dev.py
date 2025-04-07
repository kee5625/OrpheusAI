import tensorflow as tf
import os
import cv2
import numpy as np

# Building the model
import keras
from keras import layers

# Data augmentation
from keras.preprocessing import image
from keras.optimizers import Adam

# Avoid OOM errors by setting GPU Memory Consumption Growth
gpus = tf.config.experimental.list_physical_devices('GPU')
for gpu in gpus:
    tf.config.experimental.set_memory_growth(gpu, True)

data_dir = r"C:/Users/karth/OneDrive/Desktop/UNIVERSITY OF CINCINNATI/Academics/Spring 2025/Orpheus AI/OrpheusAI/Backend/data"
image_exts = ['jpeg', 'jpg', 'bmp', 'png']

# Load the data
data = keras.utils.image_dataset_from_directory(
    data_dir,
    batch_size = 32,
    image_size = (256,256)
)

# Data Augmentation for increases accuracy
data_augmentation = keras.Sequential({
    layers.RandomFlip("horizontal_and_vertical"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
    layers.RandomBrightness(0.1)
})

#data_iterator = data.as_numpy_iterator()

# Images represented as numpy arrays with each image formatted to 256 x 256
# batch = data_iterator.next()

# Pre process data
augmented_data = data.map(lambda x, y: (data_augmentation(x, training=True) / 255, y)) #Scale data down for optimization
#scaled_iterator = data.as_numpy_iterator()
#batch = scaled_iterator.next()

# Split data into training vs testing
train_size = int(len(data)*.7)
validation_size = int(len(data)*.2) + 1
test_size = int(len(data)*.1) + 1

train = augmented_data.take(train_size)
val = augmented_data.skip(train_size).take(validation_size)
test = augmented_data.skip(train_size+validation_size).take(test_size)


# Build the CNN Model
model = keras.Sequential()

# Add 3 layers
model.add(layers.Conv2D(32, (3,3), padding="same", activation='relu', input_shape=(256, 256, 3)))
model.add(layers.MaxPooling2D())

model.add(layers.Conv2D(64, (3,3), padding="same", activation='relu'))
model.add(layers.MaxPooling2D())

model.add(layers.Conv2D(128, (3,3), padding="same", activation='relu'))
model.add(layers.MaxPool2D())

model.add(layers.Flatten())
model.add(layers.Dense(256, activation='relu')) 
model.add(layers.Dropout(0.5))
model.add(layers.Dense(10, activation='softmax'))

model.compile(
    optimizer=Adam(learning_rate=1e-4),
    loss= tf.losses.SparseCategoricalCrossentropy(),
    metrics=['accuracy']
)


# Training the model
logdir = "C:/Users/karth/OneDrive/Desktop/UNIVERSITY OF CINCINNATI/Academics/Spring 2025/Orpheus AI/OrpheusAI/Backend/logs"
tensorboard_callback = keras.callbacks.TensorBoard(log_dir=logdir)

checkpoint_callback = keras.callbacks.ModelCheckpoint(
    "C:/Users/karth/OneDrive/Desktop/UNIVERSITY OF CINCINNATI/Academics/Spring 2025/Orpheus AI/OrpheusAI/Backend/v2.keras",
    save_best_only=True,
    monitor="val_accuracy",
    mode="max"
)

hist = model.fit(train, epochs=20, validation_data=val, callbacks=[tensorboard_callback, checkpoint_callback])