// section-texts.js
import scrollManager from './scrollManager.js';

// Define the scroll thresholds for each section (when each text should appear)
const sectionThresholds = {
    'bg-section-1': { start: 0, end: 0.25 },
    'bg-section-2': { start: 0.25, end: 0.5 },
    'bg-section-3': { start: 0.5, end: 0.75 },
    'bg-section-4': { start: 0.75, end: 1.0 }
};

// Configure foreground text thresholds if needed
const foregroundThresholds = {
    'fg-section-1': { start: 0, end: 0.3 }
};

// Function to update the visibility of background texts based on scroll position
function updateBackgroundTexts(scrollProgress) {
    // Handle background texts
    Object.entries(sectionThresholds).forEach(([id, { start, end }]) => {
        const element = document.getElementById(id);
        if (!element) return;
        
        // Check if current scroll progress is within this section's threshold
        if (scrollProgress >= start && scrollProgress < end) {
            // Text should be visible - fade it in if not already visible
            element.style.opacity = '1';
            element.style.transform = 'translate(-50%, -50%)';
        } else {
            // Text should be hidden - fade it out
            element.style.opacity = '0';
            // Optional: also move the text slightly up or down when hidden
            element.style.transform = 'translate(-50%, -60%)';
        }
    });
    
    // Handle foreground texts
    Object.entries(foregroundThresholds).forEach(([id, { start, end }]) => {
        const element = document.getElementById(id);
        if (!element) return;
        
        if (scrollProgress >= start && scrollProgress < end) {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        } else {
            element.style.opacity = '0';
            element.style.transform = 'translateX(-30px)';
        }
    });
}

// Listen to scroll progress using scrollManager
scrollManager.addListener((scrollProgress) => {
    updateBackgroundTexts(scrollProgress);
});

// On page load, initialize text visibility based on current scroll position
document.addEventListener('DOMContentLoaded', () => {
    // Use scrollManager's current value for initial update
    updateBackgroundTexts(scrollManager.scrollProgress);
});