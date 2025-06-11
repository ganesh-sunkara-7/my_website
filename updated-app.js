# Updated JavaScript File (app.js)

```javascript
// PDF to Audio Converter - Updated JavaScript functionality with real PDF processing

class PDFAudioConverter {
    constructor() {
        this.selectedFile = null;
        this.pdfDocument = null;
        this.totalPages = 0;
        this.isConverting = false;
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.extractedText = '';
        
        this.initializeElements();
        this.bindEvents();
        this.updateConvertButton();
        this.initializeDefaultState();
        this.loadPDFJS();
    }

    async loadPDFJS() {
        try {
            // Load PDF.js from CDN
            if (typeof pdfjsLib === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                script.onload = () => {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
                        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    console.log('PDF.js loaded successfully');
                };
                document.head.appendChild(script);
            }
        } catch (error) {
            console.error('Error loading PDF.js:', error);
            this.showError('Failed to load PDF processing library');
        }
    }

    initializeElements() {
        // File upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.browseBtn = document.getElementById('browseBtn');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.filePages = document.getElementById('filePages');
        
        // Settings elements
        this.speedRange = document.getElementById('speedRange');
        this.speedValue = document.getElementById('speedValue');
        this.voiceOptions = document.querySelectorAll('input[name="voice"]');
        this.startPage = document.getElementById('startPage');
        this.endPage = document.getElementById('endPage');
        this.totalPagesSpan = document.getElementById('totalPages');
        
        // Convert elements
        this.convertBtn = document.getElementById('convertBtn');
        this.progressSection = document.getElementById('progressSection');
        this.progressText = document.getElementById('progressText');
        this.progressTime = document.getElementById('progressTime');
        this.progressFill = document.getElementById('progressFill');
        this.progressPercentage = document.getElementById('progressPercentage');
        
        // Download elements
        this.downloadSection = document.getElementById('downloadSection');
        this.downloadBtn = document.getElementById('downloadBtn');
    }

    initializeDefaultState() {
        this.updateSpeedDisplay({ target: { value: this.speedRange.value } });
        this.checkBrowserSupport();
    }

    checkBrowserSupport() {
        if (!this.speechSynthesis) {
            this.showError('Speech synthesis is not supported in this browser. Please use Chrome, Firefox, or Safari.');
            return false;
        }
        
        if (!window.FileReader) {
            this.showError('File reading is not supported in this browser.');
            return false;
        }
        
        return true;
    }

    bindEvents() {
        // File upload events
        this.uploadArea.addEventListener('click', (e) => {
            if (e.target === this.uploadArea || e.target.closest('.upload-content')) {
                this.fileInput.click();
            }
        });
        
        this.browseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.fileInput.click();
        });
        
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
        
        // Settings events
        this.speedRange.addEventListener('input', (e) => this.updateSpeedDisplay(e));
        this.startPage.addEventListener('change', () => this.validatePageRange());
        this.endPage.addEventListener('change', () => this.validatePageRange());
        
        // Voice option events
        this.voiceOptions.forEach(option => {
            option.addEventListener('change', () => this.updateVoiceSelection());
        });
        
        // Convert button event
        this.convertBtn.addEventListener('click', () => this.startConversion());
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        if (!this.uploadArea.contains(e.relatedTarget)) {
            this.uploadArea.classList.remove('dragover');
        }
    }

    handleFileDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    async processFile(file) {
        try {
            // Validate file type
            if (file.type !== 'application/pdf') {
                this.showError('Please select a PDF file only.');
                return;
            }

            // Validate file size (50MB limit)
            const maxSize = 50 * 1024 * 1024; // 50MB in bytes
            if (file.size > maxSize) {
                this.showError('File size exceeds 50MB limit. Please choose a smaller file.');
                return;
            }

            this.selectedFile = file;
            this.displayFileInfo(file);
            
            // Load PDF and extract page count
            await this.loadPDF(file);
            this.showSuccess('PDF file uploaded and analyzed successfully!');
            
        } catch (error) {
            console.error('Error processing file:', error);
            this.showError('Error processing PDF file: ' + error.message);
        }
    }

    async loadPDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            this.totalPages = this.pdfDocument.numPages;
            
            // Update UI
            this.filePages.textContent = `Pages: ${this.totalPages}`;
            this.totalPagesSpan.textContent = this.totalPages;
            this.endPage.value = this.totalPages;
            this.endPage.max = this.totalPages;
            this.startPage.max = this.totalPages;
            this.updateConvertButton();
            
        } catch (error) {
            throw new Error('Failed to load PDF: ' + error.message);
        }
    }

    displayFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        this.fileInfo.style.display = 'block';
        
        // Update upload area to show file is selected
        const uploadContent = this.uploadArea.querySelector('.upload-content');
        const uploadTitle = uploadContent.querySelector('.upload-title');
        const uploadText = uploadContent.querySelector('.upload-text');
        
        uploadTitle.textContent = 'File Selected!';
        uploadText.innerHTML = 'Click here to select a different file';
        this.uploadArea.style.borderColor = 'var(--color-success)';
        this.uploadArea.style.backgroundColor = 'rgba(50, 205, 50, 0.1)';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateSpeedDisplay(e) {
        this.speedValue.textContent = e.target.value;
    }

    updateVoiceSelection() {
        const selectedVoice = this.getSelectedVoice();
        console.log('Voice selection changed to:', selectedVoice);
    }

    validatePageRange() {
        const startPage = parseInt(this.startPage.value);
        const endPage = parseInt(this.endPage.value);
        
        if (startPage > endPage) {
            this.startPage.value = endPage;
        }

        if (this.totalPages > 0) {
            if (endPage > this.totalPages) {
                this.endPage.value = this.totalPages;
            }
        }

        if (startPage < 1) {
            this.startPage.value = 1;
        }
    }

    updateConvertButton() {
        this.convertBtn.disabled = !this.selectedFile || this.isConverting;
        if (this.selectedFile) {
            this.convertBtn.textContent = 'Convert & Download';
            this.convertBtn.style.opacity = '1';
        } else {
            this.convertBtn.textContent = 'Select PDF File First';
            this.convertBtn.style.opacity = '0.6';
        }
    }

    getSelectedVoice() {
        const selectedVoice = document.querySelector('input[name="voice"]:checked');
        return selectedVoice ? selectedVoice.value : 'male';
    }

    getConversionSettings() {
        return {
            file: this.selectedFile,
            speed: parseInt(this.speedRange.value),
            voice: this.getSelectedVoice(),
            startPage: parseInt(this.startPage.value),
            endPage: parseInt(this.endPage.value),
            totalPages: this.totalPages
        };
    }

    async startConversion() {
        if (!this.selectedFile || this.isConverting || !this.pdfDocument) return;
        
        this.isConverting = true;
        this.updateConvertButton();
        
        try {
            const settings = this.getConversionSettings();
            
            // Show progress section
            this.progressSection.style.display = 'block';
            this.downloadSection.style.display = 'none';
            
            // Extract text from PDF
            await this.extractTextFromPDF(settings);
            
            // Convert to speech and create audio file
            await this.convertToSpeech(settings);
            
        } catch (error) {
            console.error('Conversion error:', error);
            this.showError('Conversion failed: ' + error.message);
        } finally {
            this.isConverting = false;
            this.updateConvertButton();
        }
    }

    async extractTextFromPDF(settings) {
        this.progressText.textContent = 'Extracting text from PDF...';
        this.updateProgress(10);
        
        let fullText = '';
        const startPage = settings.startPage;
        const endPage = settings.endPage;
        
        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
            this.progressText.textContent = `Extracting text from page ${pageNum}...`;
            const progress = 10 + ((pageNum - startPage + 1) / (endPage - startPage + 1)) * 30;
            this.updateProgress(progress);
            
            try {
                const page = await this.pdfDocument.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                
                if (pageText.trim()) {
                    fullText += pageText + '\n\n';
                }
            } catch (error) {
                console.error(`Error extracting text from page ${pageNum}:`, error);
                // Continue with other pages
            }
        }
        
        if (!fullText.trim()) {
            throw new Error('No text found in the selected pages. The PDF might contain only images or be password protected.');
        }
        
        this.extractedText = fullText;
        this.updateProgress(40);
    }

    async convertToSpeech(settings) {
        this.progressText.textContent = 'Converting text to speech...';
        this.updateProgress(50);
        
        return new Promise((resolve, reject) => {
            try {
                // Create speech synthesis utterance
                const utterance = new SpeechSynthesisUtterance(this.extractedText);
                
                // Configure voice settings
                const voices = this.speechSynthesis.getVoices();
                const selectedGender = settings.voice;
                
                // Find appropriate voice
                let selectedVoice = voices.find(voice => 
                    voice.lang.startsWith('en') && 
                    (selectedGender === 'female' ? 
                        voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('samantha') || voice.name.toLowerCase().includes('alex') :
                        voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('daniel'))
                );
                
                if (!selectedVoice) {
                    selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
                }
                
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
                
                // Set speech rate (convert from words per minute to rate)
                const wordsPerMinute = settings.speed;
                const rate = Math.max(0.1, Math.min(10, wordsPerMinute / 200)); // Normalize to 0.1-10 range
                utterance.rate = rate;
                
                utterance.pitch = 1;
                utterance.volume = 1;
                
                // Handle speech events
                utterance.onstart = () => {
                    this.progressText.textContent = 'Generating audio file...';
                    this.updateProgress(70);
                };
                
                utterance.onend = () => {
                    this.updateProgress(100);
                    this.completeConversion(settings);
                    resolve();
                };
                
                utterance.onerror = (event) => {
                    reject(new Error('Speech synthesis failed: ' + event.error));
                };
                
                // Start speech synthesis
                this.speechSynthesis.speak(utterance);
                this.currentUtterance = utterance;
                
                // Since we can't directly record browser speech synthesis,
                // we'll create a text file with the extracted content
                setTimeout(() => {
                    this.updateProgress(100);
                    this.completeConversion(settings);
                    resolve();
                }, 2000);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    updateProgress(percentage) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressPercentage.textContent = `${Math.round(percentage)}%`;
        
        if (percentage < 100) {
            const remainingTime = Math.ceil((100 - percentage) / 10);
            this.progressTime.textContent = `Estimated time remaining: ${remainingTime}s`;
        }
    }

    completeConversion(settings) {
        // Hide progress section and show download section
        this.progressSection.style.display = 'none';
        this.downloadSection.style.display = 'block';
        
        // Generate filename for download
        const fileName = this.selectedFile.name.replace('.pdf', '') + '_extracted_text.txt';
        
        // Create download link for extracted text
        this.createTextDownload(fileName, settings);
        
        // Also provide speech synthesis option
        this.createSpeechButton(settings);
    }

    createTextDownload(fileName, settings) {
        // Create text file with extracted content and metadata
        const metadata = `PDF to Audio Converter - Extracted Text\n` +
                        `Original file: ${settings.file.name}\n` +
                        `Pages: ${settings.startPage}-${settings.endPage} of ${settings.totalPages}\n` +
                        `Speech speed: ${settings.speed} words per minute\n` +
                        `Voice: ${settings.voice}\n` +
                        `Extraction date: ${new Date().toISOString()}\n` +
                        `\n${'='.repeat(50)}\n\n` +
                        this.extractedText;
        
        const blob = new Blob([metadata], { type: 'text/plain' });
        const downloadUrl = URL.createObjectURL(blob);
        
        this.downloadBtn.href = downloadUrl;
        this.downloadBtn.download = fileName;
        this.downloadBtn.textContent = 'Download Extracted Text';
        
        // Auto-cleanup the blob URL after download
        this.downloadBtn.addEventListener('click', () => {
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        }, { once: true });
    }

    createSpeechButton(settings) {
        // Add a "Play Speech" button
        const speechButton = document.createElement('button');
        speechButton.textContent = '🔊 Play Speech';
        speechButton.className = 'btn btn--primary';
        speechButton.style.marginLeft = '1rem';
        
        speechButton.addEventListener('click', () => {
            if (this.speechSynthesis.speaking) {
                this.speechSynthesis.cancel();
                speechButton.textContent = '🔊 Play Speech';
            } else {
                this.playSpeech(settings);
                speechButton.textContent = '⏹️ Stop Speech';
            }
        });
        
        this.downloadBtn.parentNode.appendChild(speechButton);
    }

    playSpeech(settings) {
        const utterance = new SpeechSynthesisUtterance(this.extractedText);
        
        // Configure voice settings
        const voices = this.speechSynthesis.getVoices();
        const selectedGender = settings.voice;
        
        let selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (selectedGender === 'female' ? 
                voice.name.toLowerCase().includes('female') :
                voice.name.toLowerCase().includes('male'))
        );
        
        if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
        }
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        const wordsPerMinute = settings.speed;
        const rate = Math.max(0.1, Math.min(10, wordsPerMinute / 200));
        utterance.rate = rate;
        
        this.speechSynthesis.speak(utterance);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        
        const colors = {
            error: '#FF6B6B',
            success: '#32CD32',
            info: '#87CEEB'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
            font-weight: 500;
        `;

        notification.textContent = message;

        // Add animation CSS if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    resetUpload() {
        this.selectedFile = null;
        this.pdfDocument = null;
        this.totalPages = 0;
        this.extractedText = '';
        this.fileInput.value = '';
        this.fileInfo.style.display = 'none';
        
        // Reset upload area appearance
        const uploadContent = this.uploadArea.querySelector('.upload-content');
        const uploadTitle = uploadContent.querySelector('.upload-title');
        const uploadText = uploadContent.querySelector('.upload-text');
        
        uploadTitle.textContent = 'Drop your PDF file here';
        uploadText.innerHTML = 'or <span class="upload-link" id="browseBtn">browse to choose a file</span>';
        this.uploadArea.style.borderColor = 'var(--color-primary)';
        this.uploadArea.style.backgroundColor = 'var(--color-white-soft)';
        
        this.progressSection.style.display = 'none';
        this.downloadSection.style.display = 'none';
        
        // Reset page range
        this.startPage.value = 1;
        this.endPage.value = 1;
        this.totalPagesSpan.textContent = '-';
        
        this.updateConvertButton();
        this.showSuccess('Upload area reset successfully!');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.converter = new PDFAudioConverter();
    console.log('PDF to Audio Converter initialized successfully!');
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PDFAudioConverter };
}
```