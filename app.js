// PDF to Audio Converter - JavaScript functionality
class PDFAudioConverter {
    constructor() {
        this.selectedFile = null;
        this.totalPages = 0;
        this.isConverting = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateConvertButton();
        this.initializeDefaultState();
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
        // Make sure speed display is updated
        this.updateSpeedDisplay({ target: { value: this.speedRange.value } });
        
        // Add demo functionality
        this.addDemoFeatures();
    }

    addDemoFeatures() {
        // Add a demo button for testing without file upload
        const demoButton = document.createElement('button');
        demoButton.textContent = 'Try Demo (Sample PDF)';
        demoButton.className = 'btn btn--outline';
        demoButton.style.marginTop = '1rem';
        demoButton.addEventListener('click', () => this.loadDemoFile());
        
        const uploadCard = document.querySelector('.upload-card .card__body');
        uploadCard.appendChild(demoButton);
    }

    loadDemoFile() {
        // Simulate loading a demo PDF file
        const demoFile = {
            name: 'sample-document.pdf',
            size: 2457600, // 2.4 MB
            type: 'application/pdf'
        };
        
        this.selectedFile = demoFile;
        this.displayFileInfo(demoFile);
        this.simulatePageCount(demoFile);
        
        this.showSuccess('Demo PDF loaded successfully! You can now test the conversion features.');
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

    processFile(file) {
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
        this.simulatePageCount(file);
        this.showSuccess('PDF file uploaded successfully!');
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

    simulatePageCount(file) {
        // Simulate page counting based on file size (rough estimate)
        this.totalPages = Math.max(1, Math.floor(file.size / (100 * 1024)));
        this.totalPages += Math.floor(Math.random() * 5) - 2;
        this.totalPages = Math.max(1, this.totalPages);
        
        // Update UI
        this.filePages.textContent = `Pages: ${this.totalPages}`;
        this.totalPagesSpan.textContent = this.totalPages;
        this.endPage.value = this.totalPages;
        this.endPage.max = this.totalPages;
        this.startPage.max = this.totalPages;
        
        this.updateConvertButton();
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

    calculateEstimatedTime(settings) {
        const pageCount = settings.endPage - settings.startPage + 1;
        const wordsPerPage = 250;
        const totalWords = pageCount * wordsPerPage;
        const wordsPerMinute = settings.speed;
        
        const audioDurationMinutes = totalWords / wordsPerMinute;
        const conversionTimeSeconds = Math.max(5, audioDurationMinutes * 30);
        
        return Math.ceil(conversionTimeSeconds);
    }

    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds} seconds`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            if (remainingSeconds === 0) {
                return `${minutes} minute${minutes > 1 ? 's' : ''}`;
            } else {
                return `${minutes}m ${remainingSeconds}s`;
            }
        }
    }

    async startConversion() {
        if (!this.selectedFile || this.isConverting) return;
        
        this.isConverting = true;
        this.updateConvertButton();
        
        const settings = this.getConversionSettings();
        const estimatedTimeSeconds = this.calculateEstimatedTime(settings);
        
        // Show progress section
        this.progressSection.style.display = 'block';
        this.downloadSection.style.display = 'none';
        
        // Update initial progress
        this.progressText.textContent = 'Analyzing PDF content...';
        this.progressTime.textContent = `Estimated time: ${this.formatTime(estimatedTimeSeconds)}`;
        
        // Simulate conversion process
        await this.simulateConversion(estimatedTimeSeconds, settings);
    }

    async simulateConversion(totalTimeSeconds, settings) {
        const steps = [
            { text: 'Analyzing PDF content...', duration: 0.1 },
            { text: 'Extracting text from pages...', duration: 0.3 },
            { text: 'Processing text for speech synthesis...', duration: 0.2 },
            { text: 'Generating audio with selected voice...', duration: 0.3 },
            { text: 'Finalizing MP3 file...', duration: 0.1 }
        ];
        
        let currentProgress = 0;
        let stepIndex = 0;
        
        const updateInterval = 100;
        const totalUpdates = (totalTimeSeconds * 1000) / updateInterval;
        const progressIncrement = 100 / totalUpdates;
        
        const progressTimer = setInterval(() => {
            currentProgress += progressIncrement;
            
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(progressTimer);
                this.completeConversion(settings);
                return;
            }
            
            // Update step text based on progress
            const stepProgress = currentProgress / 100;
            let newStepIndex = 0;
            let cumulativeDuration = 0;
            
            for (let i = 0; i < steps.length; i++) {
                cumulativeDuration += steps[i].duration;
                if (stepProgress <= cumulativeDuration) {
                    newStepIndex = i;
                    break;
                }
            }
            
            if (newStepIndex !== stepIndex) {
                stepIndex = newStepIndex;
                this.progressText.textContent = steps[stepIndex].text;
            }
            
            // Update progress bar
            this.progressFill.style.width = `${currentProgress}%`;
            this.progressPercentage.textContent = `${Math.round(currentProgress)}%`;
            
            // Update remaining time
            const remainingTimeSeconds = Math.ceil((totalTimeSeconds * (100 - currentProgress)) / 100);
            if (remainingTimeSeconds > 0) {
                this.progressTime.textContent = `Time remaining: ${this.formatTime(remainingTimeSeconds)}`;
            }
        }, updateInterval);
    }

    completeConversion(settings) {
        this.isConverting = false;
        this.updateConvertButton();
        
        // Hide progress section and show download section
        this.progressSection.style.display = 'none';
        this.downloadSection.style.display = 'block';
        
        // Generate filename for download
        const fileName = this.selectedFile.name.replace('.pdf', '') + '_audio.mp3';
        
        // Create a simulated download link
        this.createDownloadLink(fileName, settings);
    }

    createDownloadLink(fileName, settings) {
        // Create a simulated MP3 file content
        const audioContent = this.generateSimulatedAudioData(settings);
        const blob = new Blob([audioContent], { type: 'audio/mpeg' });
        const downloadUrl = URL.createObjectURL(blob);
        
        this.downloadBtn.href = downloadUrl;
        this.downloadBtn.download = fileName;
        
        // Auto-cleanup the blob URL after download
        this.downloadBtn.addEventListener('click', () => {
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        }, { once: true });
    }

    generateSimulatedAudioData(settings) {
        const header = 'Simulated MP3 Audio File\n';
        const metadata = `Converted from: ${this.selectedFile.name}\n`;
        const settingsInfo = `Speed: ${settings.speed} WPM, Voice: ${settings.voice}\n`;
        const pageInfo = `Pages: ${settings.startPage}-${settings.endPage} of ${settings.totalPages}\n`;
        const timestamp = `Generated: ${new Date().toISOString()}\n`;
        
        return header + metadata + settingsInfo + pageInfo + timestamp;
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
        this.totalPages = 0;
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
        
        // Re-bind browse button event
        const newBrowseBtn = uploadContent.querySelector('#browseBtn');
        newBrowseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.fileInput.click();
        });
        
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

// Enhanced UI interactions
class UIEnhancements {
    constructor() {
        this.initializeAnimations();
        this.initializeTooltips();
        this.addUtilityButtons();
    }

    initializeAnimations() {
        // Add entrance animations to cards
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    initializeTooltips() {
        const tooltips = [
            { element: '#speedRange', text: 'Adjust speech speed (50-400 words per minute)' },
            { element: 'input[name="voice"][value="male"]', text: 'Select male voice for narration' },
            { element: 'input[name="voice"][value="female"]', text: 'Select female voice for narration' },
            { element: '#startPage', text: 'Enter the first page number to convert' },
            { element: '#endPage', text: 'Enter the last page number to convert' }
        ];

        tooltips.forEach(({ element, text }) => {
            const el = document.querySelector(element);
            if (el) {
                el.title = text;
            }
        });
    }

    addUtilityButtons() {
        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset All';
        resetButton.className = 'btn btn--outline';
        resetButton.style.marginTop = '1rem';
        resetButton.addEventListener('click', () => {
            if (window.converter) {
                window.converter.resetUpload();
            }
        });
        
        const convertCard = document.querySelector('.convert-card .card__body');
        convertCard.appendChild(resetButton);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.converter = new PDFAudioConverter();
    const uiEnhancements = new UIEnhancements();
    
    console.log('PDF to Audio Converter initialized successfully!');
    
    // Add some helpful console messages
    console.log('Available features:');
    console.log('- Upload PDF files up to 50MB');
    console.log('- Adjust speech speed (50-400 WPM)');
    console.log('- Choose male or female voice');
    console.log('- Select page range for conversion');
    console.log('- Try the demo feature for testing');
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PDFAudioConverter, UIEnhancements };
}