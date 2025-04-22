document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    const submitBtn = document.getElementById('submitButton');

    if (!file) {
        alert('Please upload a file.');
        return;
    }

    const formData = new FormData();
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Processing...';

    // Check type and route to proper API
    if (file.type.startsWith('image/')) {
        formData.append('image', file);

        fetch('http://localhost:5000/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('resultModalBody').innerHTML = '';

            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                let resultHTML = '<h4 class="mb-3">Top&nbsp;3 predictions</h4>';

                data.top3.forEach((item, index) => {
                    const nameParts = item.class.split('. ');
                    const diseaseName = nameParts.length > 1 ? nameParts[1] : item.class;
                    const pubmedURL = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(diseaseName)}`;

                    resultHTML += `
                        <p class="mb-3">
                            <strong>#${index + 1}:</strong>
                            <a href="${pubmedURL}" target="_blank" rel="noopener noreferrer">${diseaseName}</a><br>
                            <strong>Confidence:</strong> ${(item.confidence * 100).toFixed(2)}%
                        </p>`;
                });

                document.getElementById('resultModalBody').innerHTML = resultHTML;
                new bootstrap.Modal(document.getElementById('resultModal')).show();
            }
        })
        .catch(err => {
            console.error(err);
            alert('An error occurred while processing the image.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit';
        });

    } else if (file.type === 'application/pdf') {
        formData.append('pdf', file);

        fetch('http://localhost:5000/analyze_pdf', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('pdfResultModalBody').innerHTML = '';

            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                const keywords = data.keywords.map(word => `<li>${word}</li>`).join('');
                const resultHTML = `
                    <h4 class="mb-3">PDF Summary</h4>
                    <p>${data.summary}</p>
                    <h5>Key Terms:</h5>
                    <ul>${keywords}</ul>
                `;

                document.getElementById('pdfResultModalBody').innerHTML = resultHTML;
                new bootstrap.Modal(document.getElementById('pdfResultModal')).show();
            }
        })
        .catch(err => {
            console.error(err);
            alert('An error occurred while processing the PDF.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit';
        });

    } else {
        alert('Unsupported file type. Please upload an image or PDF.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit';
    }
});