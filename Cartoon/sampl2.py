import cv2
import numpy as np
import matplotlib.pyplot as plt

def create_cartoon_effect(image_path, line_size=7, blur_value=7, k=3, save_path="output/cartoon_image.jpg"):
    # Step 1: Read the input image
    image = cv2.imread(image_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Step 2: Create an edge mask
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    gray_blur = cv2.medianBlur(gray, blur_value)
    edges = cv2.adaptiveThreshold(gray_blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, line_size, blur_value)

    # Step 3: Reduce the color palette
    data = np.float32(image).reshape(-1, 3)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 0.001)
    ret, label, center = cv2.kmeans(data, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    center = np.uint8(center)
    quantized_image = center[label.flatten()].reshape(image.shape)

    # Step 4: Reduce noise
    blurred = cv2.bilateralFilter(quantized_image, d=7, sigmaColor=200, sigmaSpace=200)

    # Step 5: Combine edge mask with the quantized image
    cartoon_image = cv2.bitwise_and(blurred, blurred, mask=edges)

    # Save the cartoonified image to the specified path
    cv2.imwrite(save_path, cartoon_image)

    return cartoon_image

# Example usage
image_path = "images/tajmahal.jpg"
output_path = "static/cartoonified_image.jpg"
cartoon_image = create_cartoon_effect(image_path, save_path=output_path)


