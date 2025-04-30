export async function init(containerId) {
    const container = document.getElementById(containerId);
  
    const wrapper = document.createElement('div');
    wrapper.style.textAlign = 'center';
    container.appendChild(wrapper);
  
    const title = document.createElement('h1');
    title.innerText = 'TensorFlow.js: Image Classifier';
    wrapper.appendChild(title);
  
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.disabled = true;
    fileInput.id = 'imageUpload';
    wrapper.appendChild(fileInput);
  
    const br = document.createElement('br');
    wrapper.appendChild(br);
  
    const img = document.createElement('img');
    img.id = 'uploadedImage';
    img.style.maxWidth = '300px';
    img.style.display = 'none';
    img.style.marginTop = '10px';
    //center image
    img.style.marginLeft = 'auto';
    img.style.marginRight = 'auto';
    wrapper.appendChild(img);
  
    const resultDiv = document.createElement('div');
    resultDiv.id = 'result';
    resultDiv.style.fontSize = '1.5rem';
    resultDiv.style.marginTop = '20px';
    resultDiv.innerText = 'Loading model...';
    wrapper.appendChild(resultDiv);
  
    // Load TensorFlow
    const tf = await import('@tensorflow/tfjs');
    const mobilenet = await import('@tensorflow-models/mobilenet');
    const model = await mobilenet.load();
  
    fileInput.disabled = false;
    resultDiv.innerText = 'Model loaded! Choose an image.';
  
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
        img.style.display = 'block';
        resultDiv.innerText = 'Classifying...';
      };
      reader.readAsDataURL(file);
    });
  
    img.onload = async () => {
      if (model) {
        const prediction = await model.classify(img);
        if (prediction.length > 0) {
          resultDiv.innerText = `Prediction: ${prediction[0].className} (${(prediction[0].probability * 100).toFixed(2)}%)`;
        } else {
          resultDiv.innerText = 'No prediction made.';
        }
      }
    };
  
    return {
      dispose() {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }
  