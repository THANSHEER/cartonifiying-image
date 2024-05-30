from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import cv2
import numpy as np
import uuid  # Import uuid module for generating unique filenames

class Cartoonifier:
    def __init__(self, line_size=7, blur_value=7, k=3):
        self.line_size = line_size
        self.blur_value = blur_value
        self.k = k

    def cartoonify_image(self, image_path):
        # Read the image
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Create edge mask
        def edge_mask(img):
            gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
            gray_blur = cv2.medianBlur(gray, self.blur_value)
            edges = cv2.adaptiveThreshold(gray_blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, self.line_size, self.blur_value)
            return edges

        edges = edge_mask(image)

        # Reduce the color palette
        def color_quantization(img):
            data = np.float32(img).reshape((-1, 4))
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 0.001)
            ret, label, center = cv2.kmeans(data, self.k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
            center = np.uint8(center)
            result = center[label.flatten()]
            result = result.reshape(img.shape)
            return result

        img_quantiz = color_quantization(image)

        # Reduce the noise in the image
        blurred = cv2.bilateralFilter(img_quantiz, d=7, sigmaColor=200, sigmaSpace=200)

        # Combine edge mask with quantized image
        cartoon_image = cv2.bitwise_and(blurred, blurred, mask=edges)

        return cartoon_image

app = Flask(__name__)
app.config['STATIC_FOLDER'] = 'static'

def process_image(image):
    # Generate a unique filename for the cartoonified image
    unique_filename = str(uuid.uuid4()) + ".jpg"
    cartoonified_image_path = os.path.join("static", unique_filename)

    # Save the uploaded image temporarily
    temp_image_path = "temp_image.jpg"
    image.save(temp_image_path)

    # Process the image using the Cartoonifier class
    cartoonifier = Cartoonifier()
    cartoonified_image = cartoonifier.cartoonify_image(temp_image_path)

    # Save the cartoonified image
    cv2.imwrite(cartoonified_image_path, cv2.cvtColor(cartoonified_image, cv2.COLOR_RGB2BGR))

    return cartoonified_image_path

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_image', methods=['POST'])
def process_uploaded_image():
    if 'image' in request.files:
        image = request.files['image']

        if image:
            cartoonified_image_url = process_image(image)
            return jsonify(cartoonified_image_url=cartoonified_image_url)

    return jsonify(error="No image file provided")

if __name__ == '__main__':
    app.run(debug=True, port=8080)
