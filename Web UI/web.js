function previewImage() {
  const file = document.getElementById("imageUpload").files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.getElementById("uploadedImage");
      img.src = e.target.result;
      img.style.display = "block";
      document.getElementById("imagePlaceholder").style.display = "none";
    };
    reader.readAsDataURL(file);
  }
}

function resetUpload() {
  document.getElementById("imageUpload").value = "";
  document.getElementById("uploadedImage").style.display = "none";
  document.getElementById("imagePlaceholder").style.display = "flex";
  document.getElementById("status").innerText = "Waiting for analysis...";
  document.getElementById("status").style.background = "gray";
  document.getElementById("progress").style.width = "0%";
  document.getElementById("progressText").innerText = "0%";
}

function analyzeImage() {
  const selectedModel = document
    .getElementById("dropdownMenuButton")
    .getAttribute("data-value");
  if (!selectedModel) {
    alert("Please select a model before sending!");
    return;
  }

  let progressElement = document.getElementById("progress");
  let progressText = document.getElementById("progressText");
  let statusElement = document.getElementById("status");

  statusElement.style.background = "gray";
  statusElement.innerText = "Waiting for analysis...";

  let progress = 0;
  let interval = setInterval(() => {
    progress += 10;
    progressElement.style.width = progress + "%";
    progressText.innerText = progress + "%";

    if (progress >= 100) {
      clearInterval(interval);

      let result = Math.floor(Math.random() * 101);
      statusElement.innerText = "Chín " + result + "%";

      if (result >= 0 && result <= 30) {
        statusElement.style.background = "red";
      } else if (result > 30 && result <= 70) {
        statusElement.style.background = "yellow";
        statusElement.style.color = "black";
      } else if (result > 70) {
        statusElement.style.background = "green";
      }
    }
  }, 500);
}

function selectModel(modelName) {
  document.getElementById("dropdownMenuButton").innerText = modelName;
  document
    .getElementById("dropdownMenuButton")
    .setAttribute("data-value", modelName);
}

function selectModel(modelName) {
  document.getElementById("dropdownMenuButton").innerText = modelName;
  document
    .getElementById("dropdownMenuButton")
    .setAttribute("data-value", modelName);
}
