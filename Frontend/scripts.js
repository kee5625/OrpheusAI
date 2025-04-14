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
        // const resultContainer = document.getElementById('resultContainer');
        // resultContainer.innerHTML = '';

        document.getElementById('resultModalBody').innerHTML = '';

        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            // Display results in a user-friendly way
            // const resultDiv = document.createElement('div');
            let resultHTML = '<h4 class="mb-3">Top&nbsp;3 predictions</h4>';

            data.top3.forEach((item, index) => {
                // e.g. item.class == "6. Melanoma"
                // strip off "6. "
                const nameParts = item.class.split('. ');
                const diseaseName = (nameParts.length > 1) ? nameParts[1] : item.class;
                
                // ----‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑
                //  Create a PubMed link for the disease
                // ----‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑‑
                const query = encodeURIComponent(diseaseName);
                const pubmedURL = `https://pubmed.ncbi.nlm.nih.gov/?term=${query}`;

                resultHTML += `
                    <p class="mb-3">
                        <strong>#${index + 1}:</strong>
                        <a href="${pubmedURL}" target="_blank" rel="noopener noreferrer">
                        ${diseaseName}
                        </a><br>
                        <strong>Confidence:</strong> ${(item.confidence * 100).toFixed(2)}%
                    </p>`;
            });
            
            // Inject HTML into the modal body
            document.getElementById('resultModalBody').innerHTML = resultHTML;

            // Show the modal
            const resultModal = new bootstrap.Modal(
                document.getElementById('resultModal')
            );
            resultModal.show();

            //resultContainer.innerHTML = resultHTML;
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