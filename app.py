from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import cv2
import numpy as np
import uuid  # Import uuid module for generating unique filenames

class Cartoonifier:
    def __init__(self, edge_strength=50, color_simplification=8, smoothing_level=7, style='comic', 
                 line_thickness=5, saturation=100, bold_edges=True):
        """
        Initialize the cartoonifier with customizable parameters
        
        Parameters:
        - edge_strength: Controls the prominence of edges (1-100)
        - color_simplification: Number of colors in the palette (2-32)
        - smoothing_level: Smoothing strength (1-20)
        - style: 'comic', 'anime', or 'pencil'
        - line_thickness: Thickness of comic lines (1-10)
        - saturation: Color saturation boost percentage (50-150)
        - bold_edges: Whether to use bold edges for comics
        """
        # Convert parameters to algorithm-specific values
        self.line_size = max(3, min(19, smoothing_level * 2 + 3)) # 3-19 (odd values only)
        self.blur_value = max(3, min(19, smoothing_level)) # 3-19 (odd values only)
        self.edge_threshold = max(1, min(100, 101 - edge_strength)) # Invert because lower threshold = stronger edges
        self.k = max(2, min(32, int(color_simplification))) # Number of colors
        self.style = style.lower()
        
        # Comic-specific parameters
        self.line_thickness = line_thickness
        self.saturation_boost = saturation / 100.0
        self.bold_edges = bold_edges

    def cartoonify_image(self, image_path):
        """Process image with selected cartoon style"""
        # Read the image
        image = cv2.imread(image_path)
        if image is None:
            raise Exception("Could not read image")
            
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Select the appropriate style
        if self.style == 'anime':
            return self._anime_style(image)
        elif self.style == 'pencil':
            return self._pencil_style(image)
        else: # Default to comic style
            return self._comic_style(image)

    def _comic_style(self, image):
        """Standard comic book style cartoonification, enhanced with more parameters"""
        # Create edge mask with improved parameters
        edges = self._create_edge_mask(image)
        
        # Enhanced color quantization
        img_quantized = self._color_quantization(image)
        
        # Improved bilateral filter for smoother results while preserving edges
        blurred = cv2.bilateralFilter(
            img_quantized, 
            d=9, 
            sigmaColor=self.blur_value * 10, 
            sigmaSpace=self.blur_value * 5
        )
        
        # Enhance edges based on line thickness
        if self.bold_edges:
            kernel_size = max(1, int(self.line_thickness / 2))
            kernel = np.ones((kernel_size, kernel_size), np.uint8)
            edges = cv2.dilate(edges, kernel, iterations=1)
        
        # Combine edge mask with quantized image
        cartoon = cv2.bitwise_and(blurred, blurred, mask=edges)
        
        # Enhance colors with custom saturation
        hsv = cv2.cvtColor(cartoon, cv2.COLOR_RGB2HSV)
        hsv[:,:,1] = np.clip(hsv[:,:,1] * self.saturation_boost, 0, 255).astype(np.uint8)
        enhanced_cartoon = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
        
        return enhanced_cartoon

    def _anime_style(self, image):
        """Anime-style cartoonification with cleaner lines and vibrant colors"""
        # For anime style, we want stronger edges and more vibrant colors
        
        # Create edge mask with thinner lines
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        gray_blur = cv2.medianBlur(gray, max(3, self.blur_value - 2))
        
        # Use Canny edge detector instead for cleaner lines
        edges = cv2.Canny(
            gray_blur, 
            self.edge_threshold, 
            self.edge_threshold * 3
        )
        
        # Convert to 3-channel and invert for black edges
        edges = cv2.cvtColor(edges, cv2.COLOR_GRAY2RGB)
        edges = cv2.bitwise_not(edges)
        
        # More aggressive color quantization for anime look
        img_quantized = self._color_quantization(image, k_divider=1.5)
        
        # Apply stronger bilateral filter
        blurred = cv2.bilateralFilter(
            img_quantized, 
            d=9, 
            sigmaColor=self.blur_value * 15, 
            sigmaSpace=self.blur_value * 7
        )
        
        # Enhance colors more aggressively
        hsv = cv2.cvtColor(blurred, cv2.COLOR_RGB2HSV)
        hsv[:,:,1] = np.clip(hsv[:,:,1] * 1.4, 0, 255).astype(np.uint8)  # More saturation
        enhanced = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
        
        # Blend edges and colors
        alpha = 0.3
        anime_style = cv2.addWeighted(enhanced, 1 - alpha, edges, alpha, 0)
        
        return anime_style

    def _pencil_style(self, image):
        """Pencil sketch style"""
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Invert grayscale image
        inverted = 255 - gray
        
        # Apply Gaussian blur
        blur_strength = self.blur_value * 2 + 1
        blurred = cv2.GaussianBlur(inverted, (blur_strength, blur_strength), 0)
        
        # Blend using color dodge
        pencil_sketch = cv2.divide(gray, 255 - blurred, scale=256)
        
        # Convert back to RGB
        pencil_rgb = cv2.cvtColor(pencil_sketch, cv2.COLOR_GRAY2RGB)
        
        return pencil_rgb

    def _create_edge_mask(self, img):
        """Create edge mask with improved parameters"""
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        
        # Add bilateral filter to reduce noise while preserving edges
        gray = cv2.bilateralFilter(gray, 5, 50, 50)
        gray_blur = cv2.medianBlur(gray, self.blur_value)
        
        # Adaptive threshold with adjusted parameters based on edge strength
        edges = cv2.adaptiveThreshold(
            gray_blur, 
            255, 
            cv2.ADAPTIVE_THRESH_MEAN_C, 
            cv2.THRESH_BINARY, 
            self.line_size, 
            self.edge_threshold / 10
        )
        
        # Perform morphological operations to clean up edges
        kernel = np.ones((2, 2), np.uint8)
        edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
        
        return edges

    def _color_quantization(self, img, k_divider=1.0):
        """Improved color quantization with enhanced results"""
        # Convert to float32 and reshape
        data = np.float32(img).reshape((-1, 3))
        
        # Adjust k based on divider (for different styles)
        k = max(2, int(self.k / k_divider))
        
        # K-means criteria
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 0.001)
        
        # Apply k-means
        _, label, center = cv2.kmeans(
            data, k, None, criteria, 10, cv2.KMEANS_PP_CENTERS
        )
        
        # Convert back to uint8 and original shape
        center = np.uint8(center)
        result = center[label.flatten()]
        result = result.reshape(img.shape)
        
        return result

# Update the process_image function to accept customization parameters
def process_image(image, params=None):
    # Set default parameters if none provided
    if params is None:
        params = {
            'edge_strength': 50,
            'color_simplification': 8,
            'smoothing_level': 7,
            'style': 'comic'
        }
    
    # Generate a unique filename for the cartoonified image
    unique_filename = str(uuid.uuid4()) + ".jpg"
    cartoonified_image_path = os.path.join("static", unique_filename)

    # Create static directory if it doesn't exist
    if not os.path.exists("static"):
        os.makedirs("static")

    # Save the uploaded image temporarily
    temp_image_path = "temp_image.jpg"
    image.save(temp_image_path)

    # Process the image using the Cartoonifier class with custom parameters
    cartoonifier = Cartoonifier(
        edge_strength=int(params.get('edgeStrength', 50)),
        color_simplification=int(params.get('colorSimplification', 8)),
        smoothing_level=int(params.get('smoothingLevel', 7)),
        style=params.get('style', 'comic'),
        line_thickness=int(params.get('lineThickness', 5)),
        saturation=int(params.get('saturation', 100)),
        bold_edges=params.get('boldEdges', 'true') == 'true'
    )
    
    try:
        cartoonified_image = cartoonifier.cartoonify_image(temp_image_path)
        # Save the cartoonified image
        cv2.imwrite(cartoonified_image_path, cv2.cvtColor(cartoonified_image, cv2.COLOR_RGB2BGR))
        # Clean up temp file
        if os.path.exists(temp_image_path):
            os.remove(temp_image_path)
        return cartoonified_image_path, None
    except Exception as e:
        return None, str(e)

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_image', methods=['POST'])
def process_uploaded_image():
    if 'image' in request.files:
        image = request.files['image']

        if image:
            # Extract parameters from form
            params = {
                'edgeStrength': request.form.get('edgeStrength', 50),
                'colorSimplification': request.form.get('colorSimplification', 8),
                'smoothingLevel': request.form.get('smoothingLevel', 7),
                'style': request.form.get('style', 'comic'),
                # Comic specific parameters
                'lineThickness': request.form.get('lineThickness', 5),
                'saturation': request.form.get('saturation', 100),
                'boldEdges': request.form.get('boldEdges', 'true') == 'true'
            }
            
            cartoonified_image_url, error = process_image(image, params)
            
            if error:
                return jsonify(error=error), 400
                
            return jsonify(cartoonified_image_url=cartoonified_image_url)

    return jsonify(error="No image file provided"), 400

# Add API endpoint documentation for production
@app.route('/api-docs')
def api_docs():
    return render_template('api-docs.html')

if __name__ == '__main__':
    # Production-ready configuration
    port = int(os.environ.get('PORT', 8000))
    
    # Use production server when deployed
    if os.environ.get('FLASK_ENV') == 'production':
        app.run(host='0.0.0.0', port=port)
    else:
        # Development mode
        app.run(debug=True, host='0.0.0.0', port=port)
