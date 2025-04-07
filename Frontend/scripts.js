document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    const submitBtn = document.getElementById('submitButton');
    const formData = new FormData();
    formData.append('image', file);

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Processing...';

    fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            // Display results in a user-friendly way
            const resultDiv = document.createElement('div');
            resultDiv.innerHTML = '<h3>Diagnosis (Top 3):</h3>';

            data.top3.forEach((item, index) => {
                // e.g. item.class == "6. Melanoma"
                // strip off "6. " if you only want the name
                const nameParts = item.class.split('. ');
                const diseaseName = (nameParts.length > 1) ? nameParts[1] : item.class;
                
                resultDiv.innerHTML += `
                    <p>
                      <strong>#${index + 1}:</strong> ${diseaseName}
                      <br>
                      <strong>Confidence:</strong> ${(item.confidence * 100).toFixed(2)}%
                    </p>
                `;
            });

            document.querySelector('.text-center').appendChild(resultDiv);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit';
    });
});