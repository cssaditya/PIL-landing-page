// Registration form handling
class RegistrationForm {
    constructor() {
        this.form = document.getElementById('registration-form');
        this.submitButton = document.getElementById('submit-registration');
        this.statusMessage = document.getElementById('registration-status');
        
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        // Disable submit button and show loading state
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Submitting...';
        
        // Get form data
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone')
        };

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('Registration successful! We\'ll contact you soon.', 'success');
                this.form.reset();
            } else {
                this.showMessage('Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('An error occurred. Please try again later.', 'error');
        } finally {
            // Re-enable submit button
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Register Now';
        }
    }

    showMessage(message, type) {
        if (this.statusMessage) {
            this.statusMessage.textContent = message;
            this.statusMessage.className = `registration-status ${type}`;
            this.statusMessage.style.display = 'block';
            
            // Hide message after 5 seconds
            setTimeout(() => {
                this.statusMessage.style.display = 'none';
            }, 5000);
        }
    }
}

// Initialize the registration form when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationForm();
}); 