const imageInput = document.getElementById("imageInput");
const inputImage = document.getElementById("inputImage");
const cartoonifiedImage = document.getElementById("cartoonifiedImage");
const downloadButton = document.getElementById("downloadButton");

imageInput.addEventListener("change", function () {
  const file = imageInput.files[0];
  if (file) {
    inputImage.src = URL.createObjectURL(file); // Display the selected image

    // Upload the selected image for processing
    const formData = new FormData();
    formData.append("image", file);

    // Send a POST request to process the image
    fetch("/process_image", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.cartoonified_image_url) {
          // Update the cartoonified image URL and set the src attribute
          cartoonifiedImage.src = data.cartoonified_image_url;
          downloadButton.href = data.cartoonified_image_url;
        } else {
          console.error("Error processing image:", data.error);
        }
      })
      .catch((error) => console.error("Error processing image:", error));
  }
});
