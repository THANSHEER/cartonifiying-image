const imageInput = document.getElementById("imageInput");
const inputImage = document.getElementById("inputImage");
const cartoonifiedImage = document.getElementById("cartoonifiedImage");
const downloadButton = document.getElementById("downloadButton");

imageInput.addEventListener("change", function() {
    const file = imageInput.files[0];
    if (file) {
        inputImage.src = URL.createObjectURL(file); // Use this line to display the selected image.
        console.log("File selected: " + file.name);

        // Replace with the actual URL of the cartoonified image
        const cartoonifiedImageUrl = "static/cartoonified_image.jpg"; // Update this URL

        // Check if the URL is correctly set
        console.log("Cartoonified Image URL: " + cartoonifiedImageUrl);

        cartoonifiedImage.src = cartoonifiedImageUrl; // Set the src attribute
        downloadButton.href = cartoonifiedImageUrl;
    }
});
