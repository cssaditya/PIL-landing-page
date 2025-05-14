// Scroll state manager
class ScrollManager {
    constructor() {
        this.scrollProgress = 0;
        this.listeners = [];
        this.maxScroll = 0;
        
        // Initial calculation
        this.calculateMaxScroll();
        
        // Update on resize
        window.addEventListener('resize', () => {
            this.calculateMaxScroll();
            this.update();
        });
        
        // Update on scroll
        window.addEventListener('scroll', () => this.update());
    }
    
    calculateMaxScroll() {
        // Get the total scrollable height
        const totalHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
        );
        
        // Calculate the maximum scroll position
        this.maxScroll = totalHeight - window.innerHeight;
    }
    
    update() {
        // Calculate progress based on current scroll position and max scroll
        this.scrollProgress = Math.min(window.scrollY / this.maxScroll, 1);
        console.log(this.scrollProgress);
        
        // Notify all listeners
        this.listeners.forEach(listener => listener(this.scrollProgress));
    }
    
    addListener(callback) {
        this.listeners.push(callback);
        // Immediately notify the new listener of current progress
        callback(this.scrollProgress);
    }
    
    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }
}

// Create and export a single instance
const scrollManager = new ScrollManager();
export default scrollManager; 