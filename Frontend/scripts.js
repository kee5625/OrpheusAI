document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    const submitBtn = document.getElementById('submitButton');

    if (!file || !file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Processing...';

    fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            const resultContainer = document.getElementById('resultModalBody');
            resultContainer.innerHTML = '';

            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                let resultHTML = '<h4 class="mb-3">Top 3 Predictions</h4>';
                data.top3.forEach((item, idx) => {
                    const name = item.class.split('. ')[1] || item.class;
                    const pubmedURL = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(name)}`;
                    resultHTML += `
                        <p class="mb-3">
                            <strong>#${idx + 1}:</strong> <a href="${pubmedURL}" target="_blank">${name}</a><br>
                            <strong>Confidence:</strong> ${(item.confidence * 100).toFixed(2)}%
                        </p>`;
                });
                resultContainer.innerHTML = resultHTML;

                // Show diagnosis modal
                const modal = new bootstrap.Modal(document.getElementById('resultModal'));
                modal.show();
            }
        })
        .catch(error => {
            console.error('Image Upload Error:', error);
            alert('An error occurred while processing the image.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit';
        });
});

document.getElementById('labUploadForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('labFileUpload');
    const file = fileInput.files[0];
    const submitBtn = document.getElementById('labSubmitBtn');

    if (!file || file.type !== 'application/pdf') {
        alert('Please upload a valid PDF file.');
        return;
    }

    const formData = new FormData();
    formData.append('pdf', file);
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Analyzing...';

    fetch('http://localhost:5000/analyze_pdf', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            const resultContainer = document.getElementById('pdfResultModalBody');
            resultContainer.innerHTML = '';

            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                const keywords = data.keywords.map(k => `<li>${k}</li>`).join('');
                const resultHTML = `
                    <h4 class="mb-3">Lab Report Summary</h4>
                    <p>${data.summary}</p>
                    <h5>Key Terms:</h5>
                    <ul>${keywords}</ul>
                `;
                resultContainer.innerHTML = resultHTML;

                // Show PDF modal
                const modal = new bootstrap.Modal(document.getElementById('pdfResultModal'));
                modal.show();
            }
        })
        .catch(error => {
            console.error('PDF Upload Error:', error);
            alert('An error occurred while analyzing the PDF.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Analyze';
        });
});
