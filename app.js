// FlexPresent - Flexible Presentation App
class FlexPresent {
    constructor() {
        this.cards = [];
        this.currentCardId = 0;
        this.pendingFiles = [];
        this.selectedOrientation = null;
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.videoFiles = new Map(); // Store video File objects for external export

        this.initializeElements();
        this.attachEventListeners();
        this.setupPlayfield();
        this.loadFromLocalStorage();
    }

    initializeElements() {
        // Toolbar elements
        this.addMediaBtn = document.getElementById('addMediaBtn');
        this.fileInput = document.getElementById('fileInput');
        this.bgColorBtn = document.getElementById('bgColorBtn');
        this.bgColorPicker = document.getElementById('bgColorPicker');
        this.bgImageBtn = document.getElementById('bgImageBtn');
        this.bgImageInput = document.getElementById('bgImageInput');
        this.clearBgBtn = document.getElementById('clearBgBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.exportFolderBtn = document.getElementById('exportFolderBtn');
        this.loadBtn = document.getElementById('loadBtn');
        this.loadInput = document.getElementById('loadInput');

        // Layout buttons
        this.layoutCircleBtn = document.getElementById('layoutCircleBtn');
        this.layoutCurveBtn = document.getElementById('layoutCurveBtn');
        this.layoutGridBtn = document.getElementById('layoutGridBtn');
        this.layoutLineBtn = document.getElementById('layoutLineBtn');

        // Zoom controls
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        this.refocusBtn = document.getElementById('refocusBtn');

        // Playfield
        this.playfield = document.getElementById('playfield');

        // Modals
        this.orientationModal = document.getElementById('orientationModal');
        this.landscapeBtn = document.getElementById('landscapeBtn');
        this.portraitBtn = document.getElementById('portraitBtn');
        this.cancelOrientationBtn = document.getElementById('cancelOrientationBtn');

        // Maximized view
        this.maximizedView = document.getElementById('maximizedView');
        this.closeMaximizedBtn = document.getElementById('closeMaximizedBtn');
        this.maximizedMediaContainer = document.getElementById('maximizedMediaContainer');
    }

    attachEventListeners() {
        // Media upload
        this.addMediaBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelection(e));

        // Background controls
        this.bgColorBtn.addEventListener('click', () => this.bgColorPicker.click());
        this.bgColorPicker.addEventListener('input', (e) => this.setBackgroundColor(e.target.value));
        this.bgImageBtn.addEventListener('click', () => this.bgImageInput.click());
        this.bgImageInput.addEventListener('change', (e) => this.setBackgroundImage(e));
        this.clearBgBtn.addEventListener('click', () => this.clearBackground());

        // Save/Load
        this.saveBtn.addEventListener('click', () => this.savePresentation());
        this.exportFolderBtn.addEventListener('click', () => this.exportWithExternalMedia());
        this.loadBtn.addEventListener('click', () => this.loadInput.click());
        this.loadInput.addEventListener('change', (e) => this.loadPresentation(e));

        // Layout buttons
        this.layoutCircleBtn.addEventListener('click', () => this.arrangeInCircle());
        this.layoutCurveBtn.addEventListener('click', () => this.arrangeInCurve());
        this.layoutGridBtn.addEventListener('click', () => this.arrangeInGrid());
        this.layoutLineBtn.addEventListener('click', () => this.arrangeInLine());

        // Zoom controls
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.refocusBtn.addEventListener('click', () => this.refocus());

        // Orientation modal
        this.landscapeBtn.addEventListener('click', () => this.selectOrientation('landscape'));
        this.portraitBtn.addEventListener('click', () => this.selectOrientation('portrait'));
        this.cancelOrientationBtn.addEventListener('click', () => this.closeOrientationModal());

        // Maximized view
        this.closeMaximizedBtn.addEventListener('click', () => this.closeMaximizedView());
        this.maximizedView.addEventListener('click', (e) => {
            if (e.target === this.maximizedView) {
                this.closeMaximizedView();
            }
        });
    }

    setupPlayfield() {
        // Pan functionality
        let isPanning = false;
        let startX, startY, startPanX, startPanY;

        this.playfield.addEventListener('mousedown', (e) => {
            if (e.target === this.playfield) {
                isPanning = true;
                startX = e.clientX;
                startY = e.clientY;
                startPanX = this.panX;
                startPanY = this.panY;
                this.playfield.style.cursor = 'grabbing';
            }
        });

        this.playfield.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            e.preventDefault();
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            this.panX = startPanX + deltaX;
            this.panY = startPanY + deltaY;
            this.applyTransform();
        });

        this.playfield.addEventListener('mouseup', () => {
            isPanning = false;
            this.playfield.style.cursor = 'grab';
        });
        this.playfield.addEventListener('mouseleave', () => {
            isPanning = false;
            this.playfield.style.cursor = 'grab';
        });
    }

    zoomIn() {
        this.zoomLevel = Math.min(3, this.zoomLevel + 0.2);
        this.applyTransform();
    }

    zoomOut() {
        this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.2);
        this.applyTransform();
    }

    applyTransform() {
        this.playfield.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel})`;
    }

    refocus() {
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.applyTransform();
    }

    handleFileSelection(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Store files and show modal
        this.pendingFiles = files;
        this.showOrientationModal();
    }

    showOrientationModal() {
        // Force reflow to ensure proper modal display
        this.orientationModal.classList.remove('hidden');
        this.orientationModal.offsetHeight; // Trigger reflow
    }

    closeOrientationModal() {
        // Ensure modal is hidden and state is reset
        this.orientationModal.classList.add('hidden');
        this.pendingFiles = [];

        // Reset file input properly
        this.fileInput.value = '';

        // Force reflow to ensure changes are applied
        this.orientationModal.offsetHeight;
    }

    selectOrientation(orientation) {
        if (this.pendingFiles.length === 0) {
            this.closeOrientationModal();
            return;
        }

        this.selectedOrientation = orientation;

        // Create cards from pending files
        this.pendingFiles.forEach(file => this.createCard(file, orientation));

        // Close modal after creating cards
        this.closeOrientationModal();
    }

    createCard(file, orientation) {
        const card = document.createElement('div');
        card.className = `card ${orientation}`;
        card.dataset.cardId = this.currentCardId++;

        const isVideo = file.type.startsWith('video/');

        // Center position
        const cardWidth = orientation === 'landscape' ? 300 : 200;
        const cardHeight = orientation === 'landscape' ? 200 : 300;
        const x = (this.playfield.offsetWidth / 2) - (cardWidth / 2);
        const y = (this.playfield.offsetHeight / 2) - (cardHeight / 2);
        card.style.left = `${x}px`;
        card.style.top = `${y}px`;

        // Card content
        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';

        const reader = new FileReader();
        reader.onload = (e) => {
            if (isVideo) {
                const video = document.createElement('video');
                video.src = e.target.result;
                video.muted = true;
                video.setAttribute('playsinline', '');

                // Try to get first frame
                video.addEventListener('loadeddata', () => {
                    video.currentTime = 0.1;
                });

                cardContent.appendChild(video);

                // Add play overlay
                const overlay = document.createElement('div');
                overlay.className = 'video-overlay';
                overlay.innerHTML = '▶';
                cardContent.appendChild(overlay);

                // Store video data
                card.dataset.mediaType = 'video';
                card.dataset.mediaSrc = e.target.result;
                card.dataset.videoFilename = file.name;

                // Store original video File for external export
                this.videoFiles.set(card.dataset.cardId, file);
            } else {
                const img = document.createElement('img');
                img.src = e.target.result;
                cardContent.appendChild(img);

                card.dataset.mediaType = 'image';
                card.dataset.mediaSrc = e.target.result;
            }
        };
        reader.readAsDataURL(file);

        card.appendChild(cardContent);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'card-delete';
        deleteBtn.innerHTML = '✕';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteCard(card);
        });
        card.appendChild(deleteBtn);

        // Resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        card.appendChild(resizeHandle);

        // Add interactions
        this.makeDraggable(card);
        this.makeResizable(card, resizeHandle);
        this.makeClickable(card);

        this.playfield.appendChild(card);
        this.cards.push(card);
        this.saveToLocalStorage();
    }

    makeDraggable(card) {
        let isDragging = false;
        let currentX, currentY, initialX, initialY;

        const dragStart = (e) => {
            if (e.target.classList.contains('resize-handle') ||
                e.target.classList.contains('card-delete')) {
                return;
            }

            isDragging = true;
            initialX = e.clientX - card.offsetLeft;
            initialY = e.clientY - card.offsetTop;

            card.style.cursor = 'grabbing';
        };

        const drag = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            card.style.left = `${currentX}px`;
            card.style.top = `${currentY}px`;
        };

        const dragEnd = () => {
            isDragging = false;
            card.style.cursor = 'move';
            this.saveToLocalStorage();
        };

        card.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
    }

    makeResizable(card, handle) {
        let isResizing = false;
        let startWidth, startHeight, startX, startY;

        const resizeStart = (e) => {
            e.stopPropagation();
            isResizing = true;
            startWidth = card.offsetWidth;
            startHeight = card.offsetHeight;
            startX = e.clientX;
            startY = e.clientY;
        };

        const resize = (e) => {
            if (!isResizing) return;
            e.preventDefault();

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            const newWidth = startWidth + deltaX;
            const newHeight = startHeight + deltaY;

            if (newWidth > 100) {
                card.style.width = `${newWidth}px`;
            }
            if (newHeight > 100) {
                card.style.height = `${newHeight}px`;
            }
        };

        const resizeEnd = () => {
            isResizing = false;
            this.saveToLocalStorage();
        };

        handle.addEventListener('mousedown', resizeStart);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', resizeEnd);
    }

    makeClickable(card) {
        let clickTime = 0;

        card.addEventListener('mousedown', () => {
            clickTime = Date.now();
        });

        card.addEventListener('mouseup', (e) => {
            const clickDuration = Date.now() - clickTime;

            // Only trigger if it was a quick click (not a drag)
            if (clickDuration < 200 &&
                !e.target.classList.contains('resize-handle') &&
                !e.target.classList.contains('card-delete')) {
                this.maximizeCard(card);
            }
        });
    }

    maximizeCard(card) {
        const mediaSrc = card.dataset.mediaSrc;
        const mediaType = card.dataset.mediaType;

        this.maximizedMediaContainer.innerHTML = '';

        if (mediaType === 'video') {
            const video = document.createElement('video');
            video.src = mediaSrc;
            video.controls = true;
            video.style.maxWidth = '90vw';
            video.style.maxHeight = '90vh';
            this.maximizedMediaContainer.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = mediaSrc;
            this.maximizedMediaContainer.appendChild(img);
        }

        this.maximizedView.classList.remove('hidden');
        this.setupZoom();
    }

    setupZoom() {
        let scale = 1;

        const handleWheel = (e) => {
            e.preventDefault();

            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            scale = Math.max(0.5, Math.min(3, scale + delta));

            this.maximizedMediaContainer.style.transform = `scale(${scale})`;
        };

        this.maximizedView.addEventListener('wheel', handleWheel, { passive: false });

        // Clean up on close
        this.maximizedView._wheelHandler = handleWheel;
    }

    closeMaximizedView() {
        this.maximizedView.classList.add('hidden');

        // Stop video if playing
        const video = this.maximizedMediaContainer.querySelector('video');
        if (video) {
            video.pause();
        }

        // Reset zoom
        this.maximizedMediaContainer.style.transform = 'scale(1)';

        // Remove wheel listener
        if (this.maximizedView._wheelHandler) {
            this.maximizedView.removeEventListener('wheel', this.maximizedView._wheelHandler);
        }
    }

    deleteCard(card) {
        card.remove();
        this.cards = this.cards.filter(c => c !== card);
        this.saveToLocalStorage();
    }

    setBackgroundColor(color) {
        this.playfield.style.background = color;
        this.playfield.style.backgroundImage = 'none';
        this.saveToLocalStorage();
    }

    setBackgroundImage(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.playfield.style.backgroundImage = `url(${e.target.result})`;
            this.playfield.style.backgroundSize = 'cover';
            this.playfield.style.backgroundPosition = 'center';
            this.saveToLocalStorage();
        };
        reader.readAsDataURL(file);
    }

    clearBackground() {
        this.playfield.style.background = '#2c3e50';
        this.playfield.style.backgroundImage = 'none';
        this.saveToLocalStorage();
    }

    // Layout Arrangements
    arrangeInCircle() {
        if (this.cards.length === 0) return;

        const centerX = this.playfield.offsetWidth / 2;
        const centerY = this.playfield.offsetHeight / 2;
        const radius = Math.min(centerX, centerY) * 0.6;
        const angleStep = (2 * Math.PI) / this.cards.length;

        this.cards.forEach((card, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle) - card.offsetWidth / 2;
            const y = centerY + radius * Math.sin(angle) - card.offsetHeight / 2;

            card.style.left = `${x}px`;
            card.style.top = `${y}px`;
        });
        this.saveToLocalStorage();
    }

    arrangeInCurve() {
        if (this.cards.length === 0) return;

        const width = this.playfield.offsetWidth;
        const height = this.playfield.offsetHeight;
        const padding = 100;

        this.cards.forEach((card, index) => {
            const t = index / (this.cards.length - 1 || 1);

            // Bezier curve
            const x = padding + (width - 2 * padding) * t;
            const y = height / 2 + Math.sin(t * Math.PI) * (height / 3) - card.offsetHeight / 2;

            card.style.left = `${x}px`;
            card.style.top = `${y}px`;
        });
        this.saveToLocalStorage();
    }

    arrangeInGrid() {
        if (this.cards.length === 0) return;

        const cols = Math.ceil(Math.sqrt(this.cards.length));
        const rows = Math.ceil(this.cards.length / cols);
        const spacing = 50;
        const cardWidth = 300;
        const cardHeight = 200;

        const totalWidth = cols * (cardWidth + spacing);
        const totalHeight = rows * (cardHeight + spacing);
        const startX = (this.playfield.offsetWidth - totalWidth) / 2;
        const startY = (this.playfield.offsetHeight - totalHeight) / 2;

        this.cards.forEach((card, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);

            const x = startX + col * (cardWidth + spacing);
            const y = startY + row * (cardHeight + spacing);

            card.style.left = `${x}px`;
            card.style.top = `${y}px`;
        });
        this.saveToLocalStorage();
    }

    arrangeInLine() {
        if (this.cards.length === 0) return;

        const width = this.playfield.offsetWidth;
        const height = this.playfield.offsetHeight;
        const padding = 100;
        const spacing = (width - 2 * padding) / (this.cards.length - 1 || 1);

        this.cards.forEach((card, index) => {
            const x = padding + index * spacing;
            const y = height / 2 - card.offsetHeight / 2;

            card.style.left = `${x}px`;
            card.style.top = `${y}px`;
        });
        this.saveToLocalStorage();
    }

    // Save/Load Functionality
    savePresentation() {
        const data = {
            background: {
                color: this.playfield.style.background,
                image: this.playfield.style.backgroundImage
            },
            cards: this.cards.map(card => ({
                id: card.dataset.cardId,
                orientation: card.classList.contains('landscape') ? 'landscape' : 'portrait',
                position: {
                    left: card.style.left,
                    top: card.style.top
                },
                size: {
                    width: card.style.width || (card.classList.contains('landscape') ? '300px' : '200px'),
                    height: card.style.height || (card.classList.contains('landscape') ? '200px' : '300px')
                },
                mediaType: card.dataset.mediaType,
                mediaSrc: card.dataset.mediaSrc
            }))
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `presentation-${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    async exportWithExternalMedia() {
        const zip = new JSZip();
        const timestamp = Date.now();

        // Create presentation data with hybrid storage
        const data = {
            background: {
                color: this.playfield.style.background,
                image: this.playfield.style.backgroundImage
            },
            cards: this.cards.map(card => {
                const cardData = {
                    id: card.dataset.cardId,
                    orientation: card.classList.contains('landscape') ? 'landscape' : 'portrait',
                    position: {
                        left: card.style.left,
                        top: card.style.top
                    },
                    size: {
                        width: card.style.width || (card.classList.contains('landscape') ? '300px' : '200px'),
                        height: card.style.height || (card.classList.contains('landscape') ? '200px' : '300px')
                    },
                    mediaType: card.dataset.mediaType
                };

                // Hybrid approach: embed images, link videos
                if (card.dataset.mediaType === 'image') {
                    cardData.mediaSrc = card.dataset.mediaSrc; // Embed images
                    cardData.embedded = true;
                } else if (card.dataset.mediaType === 'video') {
                    cardData.mediaPath = `media/${card.dataset.videoFilename}`; // Link videos
                    cardData.embedded = false;
                }

                return cardData;
            })
        };

        // Add JSON config to ZIP
        zip.file('presentation.json', JSON.stringify(data, null, 2));

        // Add video files to media folder in ZIP
        const mediaFolder = zip.folder('media');
        for (const [cardId, videoFile] of this.videoFiles.entries()) {
            const filename = this.cards.find(c => c.dataset.cardId === cardId)?.dataset.videoFilename;
            if (filename && videoFile) {
                mediaFolder.file(filename, videoFile);
            }
        }

        // Add README for user guidance
        const readme = `# FlexPresent Presentation Package

This folder contains your presentation with external media files.

## Structure:
- presentation.json: Configuration file with positions and embedded images
- media/: Folder containing video files

## To use on another computer:
1. Keep this entire folder together
2. Open FlexPresent
3. Click "Load" and select presentation.json
4. Make sure the media/ folder is in the same directory

## Storage Strategy (Hybrid):
- Images: Embedded in JSON (portable, usually small)
- Videos: Stored in media/ folder (keeps JSON file size manageable)

Generated: ${new Date(timestamp).toLocaleString()}
`;
        zip.file('README.txt', readme);

        // Generate and download ZIP
        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);

            const a = document.createElement('a');
            a.href = url;
            a.download = `presentation-${timestamp}.zip`;
            a.click();

            URL.revokeObjectURL(url);

            alert('✅ Presentation exported with external media!\n\nExtract the ZIP file and keep the folder structure intact.');
        } catch (error) {
            alert('❌ Export failed: ' + error.message);
            console.error('Export error:', error);
        }
    }

    async loadPresentation(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            if (file.name.endsWith('.zip')) {
                await this.loadFromZip(file);
            } else {
                await this.loadFromJSON(file);
            }
        } catch (error) {
            alert('❌ Error loading presentation: ' + error.message);
            console.error('Load error:', error);
        }

        // Reset input
        this.loadInput.value = '';
    }

    async loadFromZip(zipFile) {
        const zip = await JSZip.loadAsync(zipFile);

        // Read presentation.json
        const jsonFile = zip.file('presentation.json');
        if (!jsonFile) {
            throw new Error('presentation.json not found in ZIP');
        }

        const jsonText = await jsonFile.async('text');
        const data = JSON.parse(jsonText);

        // Create a map of video files from media folder
        const videoBlobs = new Map();
        const mediaFolder = zip.folder('media');
        if (mediaFolder) {
            const mediaFiles = [];
            mediaFolder.forEach((relativePath, file) => {
                mediaFiles.push({ name: relativePath, file });
            });

            for (const { name, file } of mediaFiles) {
                const blob = await file.async('blob');
                const url = URL.createObjectURL(blob);
                videoBlobs.set(`media/${name}`, url);
            }
        }

        // Load the presentation
        this.loadPresentationData(data, videoBlobs);
        alert('✅ Presentation loaded from ZIP successfully!');
    }

    async loadFromJSON(jsonFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.loadPresentationData(data);
                    alert('✅ Presentation loaded successfully!');
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(jsonFile);
        });
    }

    loadPresentationData(data, videoBlobs = new Map()) {
        // Clear current cards
        this.cards.forEach(card => card.remove());
        this.cards = [];
        this.videoFiles.clear();

        // Set background
        if (data.background.image && data.background.image !== 'none') {
            this.playfield.style.backgroundImage = data.background.image;
            this.playfield.style.backgroundSize = 'cover';
            this.playfield.style.backgroundPosition = 'center';
        } else if (data.background.color) {
            this.playfield.style.background = data.background.color;
        }

        // Load cards
        data.cards.forEach(cardData => {
            this.loadCard(cardData, videoBlobs);
        });
    }

    loadCard(cardData, videoBlobs = new Map()) {
        const card = document.createElement('div');
        card.className = `card ${cardData.orientation}`;
        card.dataset.cardId = cardData.id;
        card.dataset.mediaType = cardData.mediaType;

        card.style.left = cardData.position.left;
        card.style.top = cardData.position.top;
        card.style.width = cardData.size.width;
        card.style.height = cardData.size.height;

        // Card content
        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';

        if (cardData.mediaType === 'video') {
            // Hybrid: Check if video is embedded or external
            let videoSrc;
            if (cardData.embedded === false && cardData.mediaPath) {
                // External video from ZIP
                videoSrc = videoBlobs.get(cardData.mediaPath);
                if (!videoSrc) {
                    console.error(`Video not found: ${cardData.mediaPath}`);
                    videoSrc = ''; // Fallback
                }
            } else {
                // Embedded video (base64)
                videoSrc = cardData.mediaSrc;
            }

            card.dataset.mediaSrc = videoSrc;

            const video = document.createElement('video');
            video.src = videoSrc;
            video.muted = true;
            video.setAttribute('playsinline', '');

            video.addEventListener('loadeddata', () => {
                video.currentTime = 0.1;
            });

            cardContent.appendChild(video);

            const overlay = document.createElement('div');
            overlay.className = 'video-overlay';
            overlay.innerHTML = '▶';
            cardContent.appendChild(overlay);
        } else {
            // Images are always embedded
            card.dataset.mediaSrc = cardData.mediaSrc;
            const img = document.createElement('img');
            img.src = cardData.mediaSrc;
            cardContent.appendChild(img);
        }

        card.appendChild(cardContent);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'card-delete';
        deleteBtn.innerHTML = '✕';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteCard(card);
        });
        card.appendChild(deleteBtn);

        // Resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        card.appendChild(resizeHandle);

        // Add interactions
        this.makeDraggable(card);
        this.makeResizable(card, resizeHandle);
        this.makeClickable(card);

        this.playfield.appendChild(card);
        this.cards.push(card);
    }

    saveToLocalStorage() {
        const data = {
            background: {
                color: this.playfield.style.background,
                image: this.playfield.style.backgroundImage
            },
            cards: this.cards.map(card => ({
                id: card.dataset.cardId,
                orientation: card.classList.contains('landscape') ? 'landscape' : 'portrait',
                position: {
                    left: card.style.left,
                    top: card.style.top
                },
                size: {
                    width: card.style.width || (card.classList.contains('landscape') ? '300px' : '200px'),
                    height: card.style.height || (card.classList.contains('landscape') ? '200px' : '300px')
                },
                mediaType: card.dataset.mediaType,
                mediaSrc: card.dataset.mediaSrc
            }))
        };
        localStorage.setItem('flexPresent_presentation', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const savedData = localStorage.getItem('flexPresent_presentation');
        if (!savedData) return;

        try {
            const data = JSON.parse(savedData);

            // Set background
            if (data.background.image && data.background.image !== 'none') {
                this.playfield.style.backgroundImage = data.background.image;
                this.playfield.style.backgroundSize = 'cover';
                this.playfield.style.backgroundPosition = 'center';
            } else if (data.background.color) {
                this.playfield.style.background = data.background.color;
            }

            // Load cards
            data.cards.forEach(cardData => {
                this.loadCard(cardData);
            });
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FlexPresent();
});
