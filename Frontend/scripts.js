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

        // Clear previous data
        const resultContainer = document.getElementById('resultContainer');
        resultContainer.innerHTML = '';

        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            // Display results in a user-friendly way
            // const resultDiv = document.createElement('div');
            let resultHTML = '<h3>Diagnosis (Top 3):</h3>';

            data.top3.forEach((item, index) => {
                // e.g. item.class == "6. Melanoma"
                // strip off "6. "
                const nameParts = item.class.split('. ');
                const diseaseName = (nameParts.length > 1) ? nameParts[1] : item.class;
                
                resultHTML += `
                    <p>
                      <strong>#${index + 1}:</strong> ${diseaseName}
                      <br>
                      <strong>Confidence:</strong> ${(item.confidence * 100).toFixed(2)}%
                    </p>
                `;
            });

            resultContainer.innerHTML = resultHTML;
            //document.querySelector('.text-center').appendChild(resultDiv);
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