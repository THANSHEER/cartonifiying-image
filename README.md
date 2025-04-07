# Cartoonify Image

A web application that transforms regular photos into cartoon-style artwork using advanced image processing techniques. Create comic book effects, anime styles, and pencil sketches with customizable parameters.

![Cartoonify Image Demo](https://example.com/screenshot.png)

## Features

- Transform photos into cartoon-style artwork with a single click
- Three distinct style options:
  - Comic Book Style
  - Anime Style
  - Pencil Sketch
- Adjustable parameters for customization:
  - Edge Strength
  - Color Simplification
  - Smoothing Level
  - Style-specific settings like Line Thickness and Color Vibrancy
- Responsive design that works on desktop and mobile devices
- Download or share your cartoonified images

## Installation

Follow these steps to get the Cartoonify Image application running on your local machine:

### Prerequisites

- Python 3.12 or higher
- Git

### Clone the Repository

```bash
# Clone the repository
git clone  https://github.com/THANSHEER/cartonifiying-image.git

# Navigate to the project directory
cd cartoonify-image
```

### Set Up Python Environment

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# For Windows:
venv\Scripts\activate
# For macOS/Linux:
source venv/bin/activate
```

### Install Dependencies

```bash
# Install required Python packages
pip install -r requirements.txt
```

## Usage

### Running the Application

```bash
# Start the Flask server
python app.py
```

Once running, open your browser and navigate to `http://127.0.0.1:5000` to use the application.

### How to Cartoonify an Image

1. Click the "Select Image" button or drag and drop an image
2. Adjust the customization parameters as desired
3. Select a style (Comic, Anime, or Pencil)
4. Click "Apply Effects" to process the image
5. Download or share your cartoonified result

## Project Structure

```
cartoonify-image/
├── app.py                  # Flask application entry point
├── static/                 # Static assets (JS, CSS, images)
│   ├── css/
│   │   └── styles.css      # Styling for the application
│   ├── js/
│   │   ├── main.js         # Main JavaScript functionality
│   │   └── cartoonify.js   # Image processing algorithms
├── templates/              # HTML templates
│   └── index.html          # Main application page
└── requirements.txt        # Python dependencies
```

## Technologies Used

- **Backend**: Python, Flask, OpenCV, NumPy
- **Frontend**: HTML5, CSS3, JavaScript
- **Image Processing**: Custom algorithms for edge detection, color quantization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspiration from various cartoon and comic art styles
- OpenCV community for image processing libraries
