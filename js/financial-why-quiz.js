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
        <h2>✅ Your Financial Why Complete!</h2>
        <p>Thanks for sharing what drives your financial decisions. This helps us create a budgeting experience that aligns with your deeper motivations.</p>
    `;
    
    document.getElementById('insightsResult').innerHTML = `
        <h3>What happens next?</h3>
        <p>Your responses will help customize your Balynce experience with:</p>
        <ul style="text-align: left; max-width: 500px; margin: 0 auto;">
            <li><strong>Personalized budget categories</strong> that reflect what matters most to you</li>
            <li><strong>Motivational reminders</strong> tied to your core financial values</li>
            <li><strong>Goal-setting prompts</strong> that align with your deeper why</li>
            <li><strong>Notification timing</strong> that works with your decision-making style</li>
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
    formData.append('form-name', 'financial-why-responses');
    formData.append('q1_drives_choices', data.q1 || '');
    formData.append('q2_fulfillment', data.q2 || '');
    formData.append('q3_motivation', data.q3 || '');
    formData.append('q4_success', data.q4 || '');
    formData.append('q5_legacy', data.q5 || '');
    formData.append('timestamp', new Date().toISOString());

    fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    });
}

// Initialize quiz
showSection(1);