import tensorflow as tf
from keras import layers, models
from keras.applications import VGG16
import numpy as np
import cv2

class BrainTumorModel:
    def __init__(self, weights_path=None):
        self.model = self._build_model()
        if weights_path:
            self.model.load_weights(weights_path)

    def _build_model(self):
        base_model = VGG16(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
        for layer in base_model.layers:
            layer.trainable = False

        model = models.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dense(512, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(1, activation='sigmoid')
        ])

        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        return model

    def predict(self, image):
        processed_img = self._preprocess_image(image)
        prediction = self.model.predict(processed_img)[0][0]
        return prediction, None

    def _preprocess_image(self, image):
        image = cv2.resize(image, (224, 224))
        if len(image.shape) == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        image = image.astype('float32') / 255.0
        image = np.expand_dims(image, axis=0)
        return image