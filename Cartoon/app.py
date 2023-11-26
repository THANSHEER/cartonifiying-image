from flask import Flask, render_template, request, jsonify, send_from_directory
from cartoonify import cartoonify_image
import os
import cv2

app = Flask(__name__)
app.config['STATIC_FOLDER'] = 'static'

def process_image(image):
    # Save the uploaded image temporarily
    image_path = "temp_image.jpg"
    image.save(image_path)

    # Process the image using the cartoonify_image function
    cartoonified = cartoonify_image(image_path)

    # Save the cartoonified image
    output_image_path = "static/cartoonified_image.jpg"
    cv2.imwrite(output_image_path, cv2.cvtColor(cartoonified, cv2.COLOR_RGB2BGR))
    return output_image_path

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_image', methods=['POST'])
def process_uploaded_image():
    if 'image' in request.files:
        image = request.files['image']

        if image:
            processed_image_path = process_image(image)
            return jsonify(cartoonified_image_url=processed_image_path)
        else:
            return jsonify(error="No image file provided")

# Serve static files, including cartoonified images
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory("static", filename)

if __name__ == '__main__':
    app.run(debug=True, port=8080)
