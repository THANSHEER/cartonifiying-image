/**
 * Client-side Cartoonification Module
 * Implements image processing algorithms in JavaScript for better performance
 */
class Cartoonifier {
    constructor() {
        // Create offscreen canvases for processing
        this.sourceCanvas = document.createElement('canvas');
        this.sourceCtx = this.sourceCanvas.getContext('2d', { willReadFrequently: true });
        
        this.edgeCanvas = document.createElement('canvas');
        this.edgeCtx = this.edgeCanvas.getContext('2d', { willReadFrequently: true });
        
        this.resultCanvas = document.createElement('canvas');
        this.resultCtx = this.resultCanvas.getContext('2d', { willReadFrequently: true });
    }
    
    /**
     * Main processing function
     */
    async processImage(image, settings) {
        console.log("Processing image with settings:", settings);
        
        // Set up canvases
        this.sourceCanvas.width = image.width;
        this.sourceCanvas.height = image.height;
        this.edgeCanvas.width = image.width;
        this.edgeCanvas.height = image.height;
        this.resultCanvas.width = image.width;
        this.resultCanvas.height = image.height;
        
        // Draw source image
        this.sourceCtx.drawImage(image, 0, 0);
        
        // Choose style
        const style = settings.style || 'comic';
        
        switch (style) {
            case 'comic':
                return this.applyComicEffect(image, settings);
            case 'anime':
                return this.applyAnimeEffect(image, settings);
            case 'pencil':
                return this.applyPencilEffect(image, settings);
            default:
                return this.applyComicEffect(image, settings);
        }
    }
    
    /**
     * Apply comic book style effect
     */
    applyComicEffect(image, settings) {
        // Extract parameters with defaults
        const edgeStrength = parseInt(settings.edgeStrength || 50);
        const colorSimplification = parseInt(settings.colorSimplification || 8);
        const smoothingLevel = parseInt(settings.smoothingLevel || 7);
        const lineThickness = parseInt(settings.lineThickness || 5);
        const saturation = parseInt(settings.saturation || 100) / 100;
        const boldEdges = settings.boldEdges !== false;
        
        // Draw the original image
        this.sourceCtx.drawImage(image, 0, 0);
        
        // Apply bilateral filter (smoothing while preserving edges)
        this.applyBilateralFilter(smoothingLevel);
        
        // Perform color quantization
        this.quantizeColors(colorSimplification);
        
        // Detect edges
        this.detectEdges(edgeStrength, lineThickness, boldEdges);
        
        // Combine the edges with the filtered image
        this.resultCtx.drawImage(this.sourceCanvas, 0, 0);
        this.resultCtx.globalCompositeOperation = 'multiply';
        this.resultCtx.drawImage(this.edgeCanvas, 0, 0);
        this.resultCtx.globalCompositeOperation = 'source-over';
        
        // Adjust saturation
        if (saturation !== 1) {
            this.adjustSaturation(saturation);
        }
        
        return this.resultCanvas.toDataURL('image/png');
    }
    
    /**
     * Apply anime style effect
     */
    applyAnimeEffect(image, settings) {
        // Extract parameters with defaults
        const edgeStrength = parseInt(settings.edgeStrength || 50) * 1.2;
        const colorSimplification = parseInt(settings.colorSimplification || 8) / 2;
        const smoothingLevel = parseInt(settings.smoothingLevel || 7) * 1.5;
        
        // Draw the original image
        this.sourceCtx.drawImage(image, 0, 0);
        
        // Apply more aggressive smoothing
        this.applyBilateralFilter(smoothingLevel);
        
        // More aggressive color quantization
        this.quantizeColors(colorSimplification);
        
        // Create cleaner edges
        this.detectAnimeEdges(edgeStrength);
        
        // Combine with more vibrant colors
        this.resultCtx.drawImage(this.sourceCanvas, 0, 0);
        this.resultCtx.globalCompositeOperation = 'multiply';
        this.resultCtx.drawImage(this.edgeCanvas, 0, 0);
        this.resultCtx.globalCompositeOperation = 'source-over';
        
        // Higher saturation for anime style
        this.adjustSaturation(1.4);
        
        return this.resultCanvas.toDataURL('image/png');
    }
    
    /**
     * Apply pencil sketch effect
     */
    applyPencilEffect(image, settings) {
        // Extract parameters with defaults
        const smoothingLevel = parseInt(settings.smoothingLevel || 7);
        
        // Draw the original image
        this.sourceCtx.drawImage(image, 0, 0);
        
        // Get image data
        const imageData = this.sourceCtx.getImageData(
            0, 0, this.sourceCanvas.width, this.sourceCanvas.height
        );
        
        // Convert to grayscale
        this.convertToGrayscale(imageData);
        this.sourceCtx.putImageData(imageData, 0, 0);
        
        // Invert colors for pencil effect
        const inverted = this.invertColors(imageData);
        this.edgeCtx.putImageData(inverted, 0, 0);
        
        // Apply blur to the inverted image
        this.edgeCtx.filter = `blur(${smoothingLevel / 4}px)`;
        this.edgeCtx.drawImage(this.edgeCanvas, 0, 0);
        this.edgeCtx.filter = 'none';
        
                         + this.getPixelIntensity(data, width, x-1, y+1) - this.getPixelIntensity(data, width, x+1, y+1);
                         
                const gy = this.getPixelIntensity(data, width, x-1, y-1) + 2 * this.getPixelIntensity(data, width, x, y-1) + this.getPixelIntensity(data, width, x+1, y-1)
                         - this.getPixelIntensity(data, width, x-1, y+1) - 2 * this.getPixelIntensity(data, width, x, y+1) - this.getPixelIntensity(data, width, x+1, y+1);
                
                // Calculate magnitude and adjust by strength
                let mag = Math.sqrt(gx * gx + gy * gy) * factor;
                
                // Threshold for edge detection
                const edge = mag > 20 ? 0 : 255;
                
                result.data[idx] = edge;
                result.data[idx + 1] = edge;
                result.data[idx + 2] = edge;
                result.data[idx + 3] = 255;
            }
        }
        
        return result;
    }
    
    /**
     * Get pixel intensity (grayscale value)
     */
    getPixelIntensity(data, width, x, y) {
        const idx = (y * width + x) * 4;
        return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    }
    
    /**
     * Quantize colors to reduce the number of colors in the image
     */
    quantizeColors(imageData, levels) {
        const { data } = imageData;
        const result = new ImageData(new Uint8ClampedArray(data), imageData.width, imageData.height);
        
        const factor = 255 / (levels - 1);
        
        for (let i = 0; i < data.length; i += 4) {
            result.data[i] = Math.round(Math.round(data[i] / factor) * factor);
            result.data[i + 1] = Math.round(Math.round(data[i + 1] / factor) * factor);
            result.data[i + 2] = Math.round(Math.round(data[i + 2] / factor) * factor);
        }
        
        return result;
    }
    
    /**
     * Apply bilateral filter for edge-preserving smoothing
     */
    bilateralFilter(imageData, radius) {
        const { width, height, data } = imageData;
        const result = new ImageData(new Uint8ClampedArray(data), width, height);
        
        // Simplified bilateral filter (actual implementation would be more complex)
        const sigma = radius * 0.3;
        const sigmaSpace = sigma;
        const sigmaColor = sigma * 0.1;
        
        // Apply a basic blur as a simplified substitute for bilateral filter
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);
        tempCtx.filter = `blur(${sigma}px)`;
        tempCtx.drawImage(tempCanvas, 0, 0);
        
        const blurred = tempCtx.getImageData(0, 0, width, height);
        
        // Combine blurred with original to preserve edges
        for (let i = 0; i < data.length; i += 4) {
            const intensity = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const blurIntensity = (blurred.data[i] + blurred.data[i + 1] + blurred.data[i + 2]) / 3;
            
            // More weight to original if there's an edge (high difference)
            const diff = Math.abs(intensity - blurIntensity) / 255;
            const weight = Math.exp(-(diff * diff) / (2 * sigmaColor * sigmaColor));
            
            result.data[i] = data[i] * (1 - weight) + blurred.data[i] * weight;
            result.data[i + 1] = data[i + 1] * (1 - weight) + blurred.data[i + 1] * weight;
            result.data[i + 2] = data[i + 2] * (1 - weight) + blurred.data[i + 2] * weight;
        }
        
        return result;
    }
    
    /**
     * Convert image to grayscale
     */
    convertToGrayscale(imageData) {
        const { data } = imageData;
        const result = new ImageData(new Uint8ClampedArray(data), imageData.width, imageData.height);
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            result.data[i] = gray;
            result.data[i + 1] = gray;
            result.data[i + 2] = gray;
        }
        
        return result;
    }
    
    /**
     * Invert image colors
     */
    invertImage(imageData) {
        const { data } = imageData;
        const result = new ImageData(new Uint8ClampedArray(data), imageData.width, imageData.height);
        
        for (let i = 0; i < data.length; i += 4) {
            result.data[i] = 255 - data[i];
            result.data[i + 1] = 255 - data[i + 1];
            result.data[i + 2] = 255 - data[i + 2];
        }
        
        return result;
    }
}
