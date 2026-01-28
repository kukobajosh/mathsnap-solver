document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const previewArea = document.getElementById('preview-area');
    const imagePreview = document.getElementById('image-preview');
    const resultArea = document.getElementById('result-area');
    const errorArea = document.getElementById('error-area');
    const detectedTextEl = document.getElementById('detected-text');
    const solutionTextEl = document.getElementById('solution-text');
    const confidenceScoreEl = document.getElementById('confidence-score');
    const resetBtn = document.getElementById('reset-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const errorMessageEl = document.getElementById('error-message');

    let isProcessing = false;

    // Initialize Tesseract worker
    // Note: In a real prod env, we'd handle worker initialization more robustly
    
    // Event Listeners
    fileInput.addEventListener('change', handleFileSelect);
    resetBtn.addEventListener('click', resetApp);
    
    // Drag and Drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-indigo-400', 'bg-indigo-50');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-indigo-400', 'bg-indigo-50');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-indigo-400', 'bg-indigo-50');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Camera Button (Simple placeholder implementation for mobile/desktop webcam)
    cameraBtn.addEventListener('click', () => {
        // In a full implementation, we would open a video stream modal here
        // For this prototype, we'll trigger the file input capturing camera on mobile
        fileInput.setAttribute('capture', 'environment');
        fileInput.click();
        // Reset capture attribute after a short delay so normal upload still works if cancelled
        setTimeout(() => fileInput.removeAttribute('capture'), 1000);
    });

    function handleFileSelect(e) {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    }

    function handleFile(file) {
        if (isProcessing) return;
        if (!file.type.startsWith('image/')) {
            showError("Please upload a valid image file.");
            return;
        }

        // Show Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            startProcessing();
        };
        reader.readAsDataURL(file);
    }

    function startProcessing() {
        isProcessing = true;
        
        // UI Updates
        uploadArea.classList.add('hidden');
        previewArea.classList.remove('hidden');
        resultArea.classList.add('hidden');
        errorArea.classList.add('hidden');
        cameraBtn.parentElement.classList.add('hidden');
        resetBtn.classList.remove('opacity-0', 'pointer-events-none');

        processImage();
    }

    async function processImage() {
        try {
            // Using Tesseract.js from CDN
            const result = await Tesseract.recognize(
                imagePreview.src,
                'eng',
                {
                    logger: m => console.log(m)
                }
            );

            const text = result.data.text.trim();
            const confidence = result.data.confidence;

            if (!text || text.length < 1) {
                throw new Error("No text detected");
            }

            // Clean up text for math evaluation
            // Replace common OCR errors like 'x' vs '*' or 'l' vs '1' if possible
            // This is a basic cleanup
            let mathExpression = text
                .replace(/x/g, '*')      // Replace 'x' with '*'
                .replace(/X/g, '*')
                .replace(/÷/g, '/')
                .replace(/=/g, '')       // Remove equals sign if present (we want to solve)
                .replace(/[^-+*/0-9().]/g, ''); // Remove non-math chars

            if (!mathExpression) {
                throw new Error("No mathematical equation detected");
            }

            let solution;
            try {
                // Use math.js to evaluate
                solution = math.evaluate(mathExpression);
                
                // Format if it's a long decimal
                if (typeof solution === 'number' && !Number.isInteger(solution)) {
                    solution = parseFloat(solution.toFixed(4));
                }
            } catch (evalError) {
                console.error(evalError);
                throw new Error("Could not solve the detected equation");
            }

            showResult(text, solution, confidence);

        } catch (err) {
            console.error(err);
            showError("Could not identify a clear equation. Please try a cleaner image.");
        } finally {
            isProcessing = false;
        }
    }

    function showResult(detected, solution, confidence) {
        // Stop scanning animation
        const scannerOverlay = document.getElementById('scanner-overlay');
        scannerOverlay.classList.add('hidden');
        imagePreview.classList.remove('opacity-50');

        // Update Text
        detectedTextEl.textContent = detected.replace(/\n/g, ' ').substring(0, 30) + (detected.length > 30 ? '...' : '');
        solutionTextEl.textContent = `= ${solution}`;
        confidenceScoreEl.textContent = `${Math.round(confidence)}%`;

        // Show Result
        resultArea.classList.remove('hidden');
    }

    function showError(msg) {
        const scannerOverlay = document.getElementById('scanner-overlay');
        scannerOverlay.classList.add('hidden');
        imagePreview.classList.remove('opacity-50');
        
        errorMessageEl.textContent = msg;
        errorArea.classList.remove('hidden');
    }

    function resetApp() {
        fileInput.value = '';
        uploadArea.classList.remove('hidden');
        previewArea.classList.add('hidden');
        resultArea.classList.add('hidden');
        errorArea.classList.add('hidden');
        cameraBtn.parentElement.classList.remove('hidden');
        resetBtn.classList.add('opacity-0', 'pointer-events-none');
        
        document.getElementById('scanner-overlay').classList.remove('hidden');
        imagePreview.classList.add('opacity-50');
        imagePreview.src = '';
        
        isProcessing = false;
    }
});