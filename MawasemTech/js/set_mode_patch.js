
// ==========================================
// Global Mode Switcher Logic
// ==========================================
// This function allows switching between Basic, Intermediate, and Advanced modes programmatically.
// It is required for the "View Plan" functionality in Wallet Integration.

window.setMode = function (mode) {
    console.log('Switching to mode:', mode);

    // 1. Hide all inputs
    const modes = ['basic', 'intermediate', 'advanced'];
    modes.forEach(m => {
        const inputContainer = document.getElementById(`${m}-inputs`);
        if (inputContainer) {
            inputContainer.classList.remove('active');
            inputContainer.style.display = 'none';
        }

        const btn = document.getElementById(`${m}-mode`);
        if (btn) {
            btn.classList.remove('active');
        }
    });

    // 2. Activate Target
    const targetInput = document.getElementById(`${mode}-inputs`);
    const targetBtn = document.getElementById(`${mode}-mode`);

    if (targetInput) {
        targetInput.classList.add('active');
        targetInput.style.display = 'block';
    } else {
        console.warn(`Input container for mode '${mode}' not found!`);
    }

    if (targetBtn) {
        targetBtn.classList.add('active');
    }

    // 3. Update Global Calculator State if instance exists
    // Assuming 'fc' or similar instance might be used? 
    // Usually logic just reads from DOM, so DOM update is enough.
};

// Auto-attach listeners to mode buttons if they don't have them
document.addEventListener('DOMContentLoaded', function () {
    ['basic', 'intermediate', 'advanced'].forEach(mode => {
        const btn = document.getElementById(`${mode}-mode`);
        if (btn) {
            btn.addEventListener('click', function () {
                window.setMode(mode);
            });
        }
    });
});
