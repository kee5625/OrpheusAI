import tensorflow as tf
import os
import cv2
import imghdr
from matplotlib import pyplot as plt
import numpy as np
import keras


# Avoid OOM errors by setting GPU Memory Consumption Growth
gpus = tf.config.experimental.list_physical_devices('GPU')
for gpu in gpus:
    tf.config.experimental.set_memory_growth(gpu, True)

data_dir = r"C:\Users\karth\OneDrive\Desktop\UNIVERSITY OF CINCINNATI\Academics\Spring 2025\Orpheus AI\OrpheusAI\Backend\data"
image_exts = ['jpeg', 'jpg', 'bmp', 'png']

# View an image in python using matplotlip
'''
img = cv2.imread(os.path.join('data', 'Melanoma 9', 'ISIC_6718969.jpg'))

plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
plt.show()

'''

# Run through folders to check if all files follow the above extension format
'''
for image_class in os.listdir(data_dir):
    for image in os.listdir(os.path.join(data_dir, image_class)):
        image_path = os.path.join(data_dir, image_class, image)
        try:
            img = cv2.imread(image_path)
            tip = imghdr.what(image_path)
            if tip not in image_exts:
                print('Image not in ext list {}'.format(image_path))
                os.remove(image_path)
        except Exception as e:
            print('Issue with image {}'.format(image_path))
'''

# Load the data
data = tf.keras.utils.image_dataset_from_directory(data_dir)

data_iterator = data.as_numpy_iterator()

# Images represented as numpy arrays with each image formatted to 256 x 256
batch = data_iterator.next()

# Visualize the loaded data in the batch
'''
fig, ax = plt.subplots(ncols=4, figsize=(20,20))
for idx, img in enumerate(batch[0][:4]):
    ax[idx].imshow(img.astype(int))
    ax[idx].title.set_text(batch[1][idx])
'''

# Pre process data
data = data.map(lambda x, y: (x/255, y)) #Scale data down for optimization
scaled_iterator = data.as_numpy_iterator()
batch = scaled_iterator.next()

# Split data into training vs testing
train_size = int(len(data)*.7)
validation_size = int(len(data)*.2) + 1
test_size = int(len(data)*.1) + 1

train = data.take(train_size)
val = data.skip(train_size).take(validation_size)
test = data.skip(train_size+validation_size).take(test_size)

