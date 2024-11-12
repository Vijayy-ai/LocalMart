class ImageHandler {
    constructor() {
        this.imageInput = document.getElementById('image-input');
        this.previewContainer = document.getElementById('image-preview');
        this.maxFiles = 5;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        this.uploadedFiles = new Set();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.createPreviewContainer();
    }

    setupEventListeners() {
        this.imageInput?.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });
    }

    setupDragAndDrop() {
        const dropZone = document.getElementById('drop-zone');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        dropZone.addEventListener('dragover', () => {
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            this.handleFileSelect(files);
        });
    }

    createPreviewContainer() {
        if (!this.previewContainer) return;

        this.previewContainer.innerHTML = `
            <div class="preview-grid"></div>
            <div class="upload-info">
                <p>Drag & drop images or click to upload</p>
                <p class="text-muted">Max ${this.maxFiles} images, up to ${this.maxFileSize / (1024 * 1024)}MB each</p>
            </div>
        `;
    }

    async handleFileSelect(files) {
        if (!files.length) return;

        const validFiles = Array.from(files).filter(file => {
            if (!this.validateFile(file)) return false;
            return !this.uploadedFiles.has(file.name);
        });

        if (this.uploadedFiles.size + validFiles.length > this.maxFiles) {
            alert(`Maximum ${this.maxFiles} images allowed`);
            return;
        }

        for (const file of validFiles) {
            await this.processFile(file);
        }
    }

    validateFile(file) {
        if (!this.acceptedTypes.includes(file.type)) {
            alert('Invalid file type. Please upload JPG, PNG or WebP images.');
            return false;
        }

        if (file.size > this.maxFileSize) {
            alert(`File too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`);
            return false;
        }

        return true;
    }

    async processFile(file) {
        try {
            const optimizedImage = await this.optimizeImage(file);
            const previewUrl = URL.createObjectURL(optimizedImage);
            this.addPreview(previewUrl, file.name);
            this.uploadedFiles.add(file.name);
            
            // Prepare for upload
            const formData = new FormData();
            formData.append('image', optimizedImage);
            
            // Upload to server
            await this.uploadImage(formData);
        } catch (err) {
            console.error('Error processing image:', err);
            alert('Error processing image. Please try again.');
        }
    }

    async optimizeImage(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = this.calculateDimensions(img, 1920);
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.8);
            };
            img.src = URL.createObjectURL(file);
        });
    }

    calculateDimensions(img, maxWidth) {
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
            height = (maxWidth * height) / width;
            width = maxWidth;
        }
        
        return { width, height };
    }

    async uploadImage(formData) {
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error('Upload failed');
            
            const data = await response.json();
            return data.url;
        } catch (err) {
            console.error('Error uploading image:', err);
            throw err;
        }
    }

    addPreview(url, filename) {
        const previewGrid = this.previewContainer?.querySelector('.preview-grid');
        if (!previewGrid) return;

        const previewElement = document.createElement('div');
        previewElement.className = 'preview-item';
        previewElement.innerHTML = `
            <img src="${url}" alt="${filename}">
            <div class="preview-overlay">
                <button class="remove-btn" data-filename="${filename}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        previewElement.querySelector('.remove-btn').addEventListener('click', () => {
            this.removeImage(filename, previewElement);
        });

        previewGrid.appendChild(previewElement);
    }

    removeImage(filename, element) {
        this.uploadedFiles.delete(filename);
        element.remove();
    }
}

// Initialize image handler
document.addEventListener('DOMContentLoaded', () => {
    new ImageHandler();
}); 