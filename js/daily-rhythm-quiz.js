let currentSection = 1;
const totalSections = 5;

function updateProgress() {
    const progress = (currentSection / totalSections) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

function showSection(sectionNum) {
    // Hide all sections
    for (let i = 1; i <= totalSections; i++) {
        document.getElementById(`section${i}`).classList.remove('active');
    }
    
    // Show current section
    document.getElementById(`section${sectionNum}`).classList.add('active');
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.style.display = sectionNum > 1 ? 'block' : 'none';
    
    if (sectionNum === totalSections) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
    
    updateProgress();
}

function nextSection() {
    if (currentSection < totalSections) {
        currentSection++;
        showSection(currentSection);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function previousSection() {
    if (currentSection > 1) {
        currentSection--;
        showSection(currentSection);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function getFormData() {
    const formData = {};
    
    // Get radio button values for all 5 questions
    for (let i = 1; i <= 5; i++) {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected) {
            formData[`q${i}`] = selected.value;
        }
    }
    
    return formData;
}

function calculateResults() {
    const data = getFormData();
    
    // Submit data to Netlify for the app developers to use
    submitToNetlify(data);
    
    // Display completion message
    document.getElementById('personalityResult').innerHTML = `
        <h2>✅ Your Daily Rhythm Complete!</h2>
        <p>Thanks for sharing insights about your energy, relationships, and values. This helps us create spending categories that reflect your real life.</p>
    `;
    
    document.getElementById('insightsResult').innerHTML = `
        <h3>What happens next?</h3>
        <p>Your responses will help customize your Balynce experience with:</p>
        <ul style="text-align: left; max-width: 500px; margin: 0 auto;">
            <li><strong>Realistic spending categories</strong> that match how you actually live</li>
            <li><strong>Relationship-aware budgeting</strong> that considers your social patterns</li>
            <li><strong>Energy-based timing</strong> for financial tasks and reminders</li>
            <li><strong>Values-aligned goals</strong> that motivate you authentically</li>
        </ul>
    `;
    
    // Hide quiz sections and show results
    for (let i = 1; i <= totalSections; i++) {
        document.getElementById(`section${i}`).classList.remove('active');
    }
    document.getElementById('results').classList.add('active');
    document.querySelector('.navigation').style.display = 'none';
}

function submitToNetlify(data) {
    const formData = new FormData();
    formData.append('form-name', 'daily-rhythm-responses');
    formData.append('q1_recharge', data.q1 || '');
    formData.append('q2_money_relationships', data.q2 || '');
    formData.append('q3_growth', data.q3 || '');
    formData.append('q4_identity', data.q4 || '');
    formData.append('q5_values', data.q5 || '');
    formData.append('timestamp', new Date().toISOString());

    fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    });
}

// Initialize quiz
showSection(1);