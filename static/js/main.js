/**
 * Cartoonify - Main JavaScript
 * Production-ready code with error handling and performance optimizations
 */
document.addEventListener("DOMContentLoaded", function() {
    // DOM Elements
    const imageInput = document.getElementById("imageInput");
    const uploadButton = document.getElementById("uploadButton");
    const fileInfo = document.getElementById("fileInfo");
    const inputImage = document.getElementById("inputImage");
    const inputPlaceholder = document.getElementById("inputPlaceholder");
    const cartoonifiedImage = document.getElementById("cartoonifiedImage");
    const resultPlaceholder = document.getElementById("resultPlaceholder");
    const loader = document.getElementById("loader");
    const downloadButton = document.getElementById("downloadButton");
    const shareButton = document.getElementById("shareButton");
    const statusNotification = document.getElementById("statusNotification");
    
    // Modal elements
    const modalOverlay = document.getElementById("modalOverlay");
    const modalTitle = document.getElementById("modalTitle");
    const modalMessage = document.getElementById("modalMessage");
    const modalCloseButton = document.getElementById("modalCloseButton");
    const closeModalButton = document.querySelector(".close-modal");
    
    // Customization elements
    const edgeStrength = document.getElementById("edgeStrength");
    const colorSimplification = document.getElementById("colorSimplification");
    const smoothingLevel = document.getElementById("smoothingLevel");
    const styleButtons = document.querySelectorAll(".style-button");
    const applyCustomization = document.getElementById("applyCustomization");
    const resetCustomization = document.getElementById("resetCustomization");
    
    // Comic style specific controls
    const comicLineThickness = document.getElementById("comicLineThickness");
    const comicSaturation = document.getElementById("comicSaturation");
    const comicBoldEdges = document.getElementById("comicBoldEdges");
    
    // Style panels
    const comicAdvancedControls = document.getElementById("comicAdvancedControls");
    
    // Landing page elements
    const landingPage = document.getElementById("landingPage");
    const getStartedButton = document.getElementById("getStartedButton");
    const mainApp = document.getElementById("mainApp");
    
    // Initialize landing page if it exists
    if (landingPage && getStartedButton && mainApp) {
        // Set up floating animations for option items
        const optionItems = document.querySelectorAll('.option-item');
        
        // Initially hide option items
        optionItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
        });
        
        // Fade in option items with staggered delay
        setTimeout(() => {
            optionItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 200);
            });
        }, 300);
        
        // Show main app when Get Started button is clicked
        getStartedButton.addEventListener("click", function() {
            landingPage.classList.add("exit");
            
            setTimeout(() => {
                landingPage.style.display = "none";
                mainApp.classList.remove("hidden");
                mainApp.classList.add("visible");
            }, 500); // Match this with the CSS transition duration
        });
        
        console.log("Landing page initialized");
    } else {
        // If no landing page, ensure main app is visible
        if (mainApp) {
            mainApp.classList.remove("hidden");
            mainApp.classList.add("visible");
        }
        console.log("No landing page found, showing main app directly");
    }
    
    // Default settings
    const defaultSettings = {
        edgeStrength: 50,
        colorSimplification: 8,
        smoothingLevel: 7,
        style: "comic"
    };
    
    // Variables
    let currentImage = null;
    let isProcessing = false;
    
    // File upload functionality
    uploadButton.addEventListener("click", function() {
        imageInput.click();
    });

    imageInput.addEventListener("change", function(e) {
        handleFileSelection(this.files);
    });

    // Process file selection
    function handleFileSelection(files) {
        if (!files || files.length === 0) {
            showNotification("No file selected", true);
            return;
        }
        
        const file = files[0];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showModal("Invalid File", "Please select a valid image file (JPEG, PNG, etc.)");
            return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showModal("File Too Large", "Please select an image smaller than 5MB");
            return;
        }
        
        // Store current image
        currentImage = file;
        fileInfo.textContent = file.name;
        
        // Display the preview
        const objectUrl = URL.createObjectURL(file);
        inputImage.onload = function() {
            inputImage.style.display = "block";
            inputPlaceholder.style.display = "none";
            
            // Process the image automatically
            processImage();
        };
        inputImage.src = objectUrl;
    }

    // Process the image with server - enhanced with comic-specific parameters
    function processImage() {
        if (!currentImage || isProcessing) return;
        
        isProcessing = true;
        
        // Show loader and hide previous result
        loader.style.display = "flex";
        cartoonifiedImage.style.display = "none";
        resultPlaceholder.style.display = "none";
        downloadButton.classList.add("disabled");
        shareButton.classList.add("disabled");
        
        // Get current settings
        const settings = {
            edgeStrength: edgeStrength.value,
            colorSimplification: colorSimplification.value,
            smoothingLevel: smoothingLevel.value,
            style: document.querySelector(".style-button.active").id.replace("style", "").toLowerCase()
        };
        
        // Add comic-specific settings if applicable
        if (settings.style === "comic") {
            if (comicLineThickness) settings.lineThickness = comicLineThickness.value;
            if (comicSaturation) settings.saturation = comicSaturation.value;
            if (comicBoldEdges) settings.boldEdges = comicBoldEdges.checked;
        }
        
        // Create form data
        const formData = new FormData();
        formData.append("image", currentImage);
        
        // Add settings
        Object.keys(settings).forEach(key => {
            formData.append(key, settings[key]);
        });
        
        showNotification("Processing image...");
        
        // Send request
        fetch("/process_image", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || "Server error");
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.cartoonified_image_url) {
                // Load result image
                cartoonifiedImage.onload = function() {
                    loader.style.display = "none";
                    cartoonifiedImage.style.display = "block";
                    downloadButton.classList.remove("disabled");
                    shareButton.classList.remove("disabled");
                    downloadButton.href = data.cartoonified_image_url;
                    showNotification("Image processed successfully!");
                    
                    // Add animation
                    cartoonifiedImage.classList.add("pop-in");
                    setTimeout(() => {
                        cartoonifiedImage.classList.remove("pop-in");
                    }, 500);
                };
                cartoonifiedImage.onerror = function() {
                    throw new Error("Failed to load processed image");
                };
                cartoonifiedImage.src = data.cartoonified_image_url + "?t=" + new Date().getTime();
            } else {
                throw new Error("No result returned from server");
            }
        })
        .catch(error => {
            loader.style.display = "none";
            resultPlaceholder.style.display = "block";
            console.error("Error:", error);
            showModal("Processing Error", "Failed to process the image: " + error.message);
        })
        .finally(() => {
            isProcessing = false;
        });
    }

    // Slider value display updates
    function updateSliderValueDisplay(slider, index) {
        const display = document.querySelectorAll(".control-group .value-display")[index];
        display.textContent = slider.value;
    }
    
    edgeStrength.addEventListener("input", function() {
        updateSliderValueDisplay(this, 0);
    });
    
    colorSimplification.addEventListener("input", function() {
        updateSliderValueDisplay(this, 1);
    });
    
    smoothingLevel.addEventListener("input", function() {
        updateSliderValueDisplay(this, 2);
    });
    
    // Style button handlers with advanced controls toggle
    styleButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            styleButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            
            // Toggle appropriate advanced controls
            const style = this.id.replace("style", "").toLowerCase();
            
            // Hide all advanced controls first
            if (comicAdvancedControls) comicAdvancedControls.style.display = "none";
            // Add similar lines for anime and pencil when implemented
            
            // Show only the relevant controls
            if (style === "comic" && comicAdvancedControls) {
                comicAdvancedControls.style.display = "block";
            }
            // Add similar conditions for anime and pencil
        });
    });
    
    // Slider value display updates for comic controls
    if (comicLineThickness) {
        comicLineThickness.addEventListener("input", function() {
            updateCustomSliderValue(this, "comicLineThickness");
        });
    }
    
    if (comicSaturation) {
        comicSaturation.addEventListener("input", function() {
            updateCustomSliderValue(this, "comicSaturation");
        });
    }
    
    function updateCustomSliderValue(slider, id) {
        const valueDisplay = slider.parentElement.querySelector(".value-display");
        if (valueDisplay) {
            valueDisplay.textContent = slider.value;
        }
    }
    
    // Apply customization
    applyCustomization.addEventListener("click", function() {
        if (!currentImage) {
            showModal("No Image", "Please upload an image first");
            return;
        }
        processImage();
    });
    
    // Reset customization
    resetCustomization.addEventListener("click", function() {
        edgeStrength.value = defaultSettings.edgeStrength;
        colorSimplification.value = defaultSettings.colorSimplification;
        smoothingLevel.value = defaultSettings.smoothingLevel;
        
        updateSliderValueDisplay(edgeStrength, 0);
        updateSliderValueDisplay(colorSimplification, 1);
        updateSliderValueDisplay(smoothingLevel, 2);
        
        // Reset style button
        styleButtons.forEach(btn => {
            btn.classList.remove("active");
            if (btn.id === "styleComic") {
                btn.classList.add("active");
            }
        });
        
        if (currentImage) {
            processImage();
        }
    });
    
    // Share button
    shareButton.addEventListener("click", function() {
        if (!cartoonifiedImage.src || cartoonifiedImage.style.display === "none") {
            showNotification("No image to share", true);
            return;
        }
        
        if (navigator.share) {
            fetch(cartoonifiedImage.src)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "cartoonified_image.png", { type: "image/png" });
                    navigator.share({
                        title: "My Cartoonified Image",
                        text: "Check out this cartoonified image I created!",
                        files: [file]
                    })
                    .then(() => showNotification("Image shared successfully!"))
                    .catch(err => {
                        console.error("Error sharing:", err);
                        if (err.name !== "AbortError") {
                            showNotification("Failed to share", true);
                        }
                    });
                });
        } else {
            showModal("Sharing Unavailable", "Sharing is not supported on this browser. You can download the image instead.");
        }
    });
    
    // Modal handling
    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalOverlay.classList.add("show");
    }
    
    function closeModal() {
        modalOverlay.classList.remove("show");
    }
    
    modalCloseButton.addEventListener("click", closeModal);
    closeModalButton.addEventListener("click", closeModal);
    
    modalOverlay.addEventListener("click", function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Notification handling
    function showNotification(message, isError = false) {
        if (statusNotification.classList.contains("show")) {
            statusNotification.classList.remove("show");
            setTimeout(() => showNotificationWithDelay(message, isError), 300);
        } else {
            showNotificationWithDelay(message, isError);
        }
    }
    
    function showNotificationWithDelay(message, isError) {
        statusNotification.textContent = message;
        statusNotification.className = "status-notification";
        
        if (isError) {
            statusNotification.classList.add("error");
        }
        
        statusNotification.classList.add("show");
        
        setTimeout(() => {
            statusNotification.classList.remove("show");
        }, 3000);
    }
    
    // Privacy, Terms, and About links
    document.getElementById("privacyLink")?.addEventListener("click", function(e) {
        e.preventDefault();
        showModal("Privacy Policy", "Your privacy is important to us. This app processes images in the browser and on our secure servers. We do not store your images permanently, and they are deleted after processing.");
    });
    
    document.getElementById("termsLink")?.addEventListener("click", function(e) {
        e.preventDefault();
        showModal("Terms of Use", "By using this application, you agree not to upload illegal or offensive content. The service is provided 'as is' without warranty of any kind.");
    });
    
    document.getElementById("aboutLink")?.addEventListener("click", function(e) {
        e.preventDefault();
        showModal("About", "Cartoonify is an image processing tool that transforms your photos into cartoon-style artwork. It uses advanced algorithms to detect edges and simplify colors for a cartoon effect.");
    });
    
    // Keyboard shortcuts
    document.addEventListener("keydown", function(e) {
        // Escape to close modal
        if (e.key === "Escape") {
            if (modalOverlay.classList.contains("show")) {
                closeModal();
            }
        }
    });
    
    // Performance optimization
    window.addEventListener("resize", debounce(function() {
        // Adjust UI components if needed on resize
    }, 250));
    
    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
});
