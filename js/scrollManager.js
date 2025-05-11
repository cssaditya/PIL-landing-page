// Scroll state manager
class ScrollManager {
    constructor() {
        this.scrollProgress = 0;
        this.listeners = new Set();
        
        // Initialize scroll listener
        window.addEventListener('scroll', () => {
            this.updateScrollProgress();
        });
    }

    updateScrollProgress() {
        // Calculate scroll progress (0 to 1)
        this.scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        
        // Notify all listeners
        this.notifyListeners();
    }

    addListener(callback) {
        this.listeners.add(callback);
    }

    removeListener(callback) {
        this.listeners.delete(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.scrollProgress));
    }

    getScrollProgress() {
        return this.scrollProgress;
    }
}

// Create a single instance to be used across all files
const scrollManager = new ScrollManager();

export default scrollManager; 