let currentSection = 1;
const totalSections = 4;

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
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function previousSection() {
    if (currentSection > 1) {
        currentSection--;
        showSection(currentSection);
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function getFormData() {
    const formData = {};
    
    // Get radio button values
    for (let i = 1; i <= 12; i++) {
        if (i !== 3) { // Skip question 3 (checkboxes)
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            if (selected) {
                formData[`q${i}`] = selected.value;
            }
        }
    }
    
    // Get checkbox values for question 3
    const q3Values = [];
    const q3Checkboxes = document.querySelectorAll('input[name="q3"]:checked');
    q3Checkboxes.forEach(checkbox => {
        q3Values.push(checkbox.value);
    });
    formData.q3 = q3Values;
    
    return formData;
}

function calculateResults() {
    const data = getFormData();
    
    // Calculate the four trait axes: S/P, C/A, J/F, D/E
    let spendingStyle = calculateSpendingStyle(data);
    let moneyMindset = calculateMoneyMindset(data);
    let structurePreference = calculateStructurePreference(data);
    let motivationStyle = calculateMotivationStyle(data);
    
    const personalityCode = spendingStyle + moneyMindset + structurePreference + motivationStyle;
    const personalityData = getPersonalityData(personalityCode);
    
    // Submit data to Netlify
    submitToNetlify(data, personalityCode);
    
    // Display results
    document.getElementById('personalityResult').innerHTML = `
        <h2>${personalityData.name}</h2>
        <p><strong>Type:</strong> ${personalityCode} - ${personalityData.subtitle}</p>
        <p>${personalityData.description}</p>
    `;
    
    document.getElementById('insightsResult').innerHTML = `
        <h3>Your Financial Profile</h3>
        <p><strong>Behavior:</strong> ${personalityData.behavior}</p>
        <p><strong>What You Need:</strong> ${personalityData.needs}</p>
        <p><strong>Content Style:</strong> ${personalityData.contentVibe}</p>
    `;
    
    // Hide quiz sections and show results
    for (let i = 1; i <= totalSections; i++) {
        document.getElementById(`section${i}`).classList.remove('active');
    }
    document.getElementById('results').classList.add('active');
    document.querySelector('.navigation').style.display = 'none';
}

function calculateSpendingStyle(data) {
    let saveScore = 0;
    let spendScore = 0;
    
    // Q4: Unexpected money behavior
    if (data.q4 === 'save_all') saveScore += 3;
    else if (data.q4 === 'save_some') saveScore += 1;
    else if (data.q4 === 'meaningful_spend') spendScore += 1;
    else if (data.q4 === 'spend_fun') spendScore += 3;
    
    // Q7: Shopping behavior
    if (data.q7 === 'strict_list') saveScore += 2;
    else if (data.q7 === 'general_plan') saveScore += 1;
    else if (data.q7 === 'browse_thoughtful') spendScore += 1;
    else if (data.q7 === 'buy_exciting') spendScore += 2;
    
    return saveScore > spendScore ? 'S' : 'P';
}

function calculateMoneyMindset(data) {
    let confidentScore = 0;
    let anxiousScore = 0;
    
    // Q5: Bill paying behavior
    if (data.q5 === 'immediate') confidentScore += 2;
    else if (data.q5 === 'prompt') confidentScore += 1;
    else if (data.q5 === 'close_date') anxiousScore += 1;
    else if (data.q5 === 'sometimes_late') anxiousScore += 2;
    
    // Q8: What brings satisfaction
    if (data.q8 === 'security') anxiousScore += 1;
    else if (data.q8 === 'freedom' || data.q8 === 'milestones') confidentScore += 1;
    
    // Q12: Deep resonance
    if (data.q12 === 'peace_mind') anxiousScore += 2;
    else if (data.q12 === 'tool_life' || data.q12 === 'identity') confidentScore += 2;
    
    return confidentScore > anxiousScore ? 'C' : 'A';
}

function calculateStructurePreference(data) {
    let structuredScore = 0;
    let flexibleScore = 0;
    
    // Q6: Budget preference
    if (data.q6 === 'detailed') structuredScore += 3;
    else if (data.q6 === 'structured_flexible') structuredScore += 1;
    else if (data.q6 === 'simple_broad') flexibleScore += 1;
    else if (data.q6 === 'minimal') flexibleScore += 3;
    
    // Q5: Bill paying (also indicates structure preference)
    if (data.q5 === 'immediate') structuredScore += 1;
    else if (data.q5 === 'sometimes_late') flexibleScore += 1;
    
    return structuredScore > flexibleScore ? 'J' : 'F';
}

function calculateMotivationStyle(data) {
    let dataScore = 0;
    let experienceScore = 0;
    
    // Q9: Saving motivation
    if (data.q9 === 'projections' || data.q9 === 'metrics') dataScore += 2;
    else if (data.q9 === 'lifestyle' || data.q9 === 'emotional') experienceScore += 2;
    
    // Q11: Decision making
    if (data.q11 === 'facts_logic') dataScore += 2;
    else if (data.q11 === 'feelings_intuition') experienceScore += 2;
    else if (data.q11 === 'past_experience') experienceScore += 1;
    
    return dataScore > experienceScore ? 'D' : 'E';
}

function getPersonalityData(code) {
    const personalities = {
        'SCJD': {
            name: 'The Strategist',
            subtitle: 'Confident Saver, Structured, Data-Driven',
            description: 'You want precision and mastery. You thrive with clear budgets, performance insights, and optimized systems.',
            behavior: 'Systematic, deliberate, and steady',
            needs: 'Forecast tools, trend analytics, financial dashboards',
            contentVibe: 'Focused, insightful, no-nonsense'
        },
        'SCJE': {
            name: 'The Achiever',
            subtitle: 'Confident Saver, Structured, Experience-Driven',
            description: 'You love hitting financial goals that connect to real-life dreams. Systems excite you because they create freedom.',
            behavior: 'Motivated and milestone-oriented',
            needs: 'Visual progress, savings goals, vacation motivators',
            contentVibe: 'Optimistic, bold, energetic'
        },
        'SCFD': {
            name: 'The Intuitive Saver',
            subtitle: 'Confident Saver, Flexible, Data-Driven',
            description: 'You\'re confident in your choices but want budgeting to adapt to your flow. You value clarity without rigidity.',
            behavior: 'Low-pressure planner, rhythm-based',
            needs: 'Adaptive reminders, simple check-ins, smart tips',
            contentVibe: 'Friendly, encouraging, flexible'
        },
        'SCFE': {
            name: 'The Balanced Builder',
            subtitle: 'Confident Saver, Flexible, Experience-Driven',
            description: 'You value your time, energy, and lifestyle. Budgeting should support your best life, not control it.',
            behavior: 'Mindful saver who enjoys life',
            needs: 'Lifestyle alignment tools, value-based goals',
            contentVibe: 'Warm, realistic, human'
        },
        'SAJD': {
            name: 'The Worried Optimizer',
            subtitle: 'Anxious Saver, Structured, Data-Driven',
            description: 'You seek order and certainty. Budgeting helps you feel safe, but too many unknowns make you uneasy.',
            behavior: 'Over-preparer, number-checker',
            needs: 'Risk indicators, reassurance tools, alerts',
            contentVibe: 'Calm, grounded, gently directive'
        },
        'SAJE': {
            name: 'The Hopeful Rebuilder',
            subtitle: 'Anxious Saver, Structured, Experience-Driven',
            description: 'You\'ve felt stressed about money, but you\'re ready to move forward. You need structure that doesn\'t feel like punishment.',
            behavior: 'Cautious, emotionally sensitive',
            needs: 'Encouraging tone, visual motivation, progress wins',
            contentVibe: 'Uplifting, gentle, forward-looking'
        },
        'SAFD': {
            name: 'The Soft Planner',
            subtitle: 'Anxious Saver, Flexible, Data-Driven',  // FIXED: Was showing "Anxious Spender"
            description: 'You like feeling in control, but too much structure can be draining. You want support without judgment.',
            behavior: 'Fluctuates between cautious and curious',
            needs: 'Low-stakes tools, optional tracking, supportive reminders',
            contentVibe: 'Forgiving, human, helpful'
        },
        'SAFE': {
            name: 'The Relatable Realist',
            subtitle: 'Anxious Saver, Flexible, Experience-Driven',
            description: 'Budgeting doesn\'t come naturally, but you\'re trying. You need a chill, relatable guide—not a spreadsheet tyrant.',
            behavior: 'Budgeting avoidant, but money-aware',
            needs: 'Gentle check-ins, flexible suggestions, real-life examples',
            contentVibe: 'Conversational, casual, kind'
        },
        'PCJD': {
            name: 'The Confident Spender',
            subtitle: 'Confident Spender, Structured, Data-Driven',
            description: 'You spend with intention and track with precision. You want to maximize your lifestyle while staying in control.',
            behavior: 'High-agency, efficiency-driven',
            needs: 'Cash flow tools, advanced controls, proactive alerts',
            contentVibe: 'Empowering, sharp, strategic'
        },
        'PCJE': {
            name: 'The Ambitious Creator',
            subtitle: 'Confident Spender, Structured, Experience-Driven',
            description: 'You have big goals, and money is your fuel. You want tools that drive your progress—not slow it down.',
            behavior: 'Builder, planner, dream-funder',
            needs: 'Income plans, visual timelines, gamified growth',
            contentVibe: 'Driven, inspiring, visionary'
        },
        'PCFD': {
            name: 'The Experimental Optimizer',
            subtitle: 'Confident Spender, Flexible, Data-Driven',
            description: 'You treat budgeting like a puzzle—one you enjoy tweaking. You like testing tools and learning through action.',
            behavior: 'Curious, hands-on',
            needs: 'Budget sandbox, simulations, trend feedback',
            contentVibe: 'Clever, exploratory, lighthearted'
        },
        'PCFE': {
            name: 'The Inspired Adventurer',
            subtitle: 'Confident Spender, Flexible, Experience-Driven',
            description: 'You want a full life, not a full spreadsheet. Budgeting should enhance your adventures, not limit them.',
            behavior: 'Intentional spender, high on vision',
            needs: 'Savings motivation, lifestyle visuals, joy metrics',
            contentVibe: 'Aspirational, aesthetic, emotional'
        },
        'PAJD': {
            name: 'The Stressed Analyst',
            subtitle: 'Anxious Spender, Structured, Data-Driven',
            description: 'You worry about spending but also crave control. You want clear direction and validation that you\'re okay.',
            behavior: 'Overanalyzer, cautious spender',
            needs: 'Boundaries, reassurance, nonjudgmental feedback',
            contentVibe: 'Supportive, informative, steady'
        },
        'PAJE': {
            name: 'The Rebuilding Dreamer',
            subtitle: 'Anxious Spender, Structured, Experience-Driven',
            description: 'You\'re overwhelmed but hopeful. You need encouragement, and you want budgeting to feel good again.',
            behavior: 'Eager but hesitant',
            needs: 'Emotional reinforcement, visual growth',
            contentVibe: 'Positive, shame-free, light'
        },
        'PAFD': {
            name: 'The Emotional Tracker',
            subtitle: 'Anxious Spender, Flexible, Data-Driven',
            description: 'You feel a lot about money. You\'re aware, and you want to grow—but pressure makes you spiral.',
            behavior: 'Reflective, emotionally reactive',
            needs: 'Consistency without rigidity, gentle progress',
            contentVibe: 'Empathic, affirming, soft'
        },
        'PAFE': {
            name: 'The Free-Spirited Spender',
            subtitle: 'Anxious Spender, Flexible, Experience-Driven',
            description: 'You care about money, but life comes first. You\'ll budget if it feels natural and doesn\'t weigh you down.',
            behavior: 'Values-driven, accountability avoidant',
            needs: 'Guardrails not gates, vibe-based insights',
            contentVibe: 'Playful, flexible, affirming'
        }
    };
    
    return personalities[code] || personalities['SCFE']; // Default fallback
}

function restartQuiz() {
    // Reset form
    const form = document.querySelector('.quiz-container');
    const inputs = form.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    inputs.forEach(input => input.checked = false);
    
    // Reset to first section
    currentSection = 1;
    showSection(1);
    
    // Hide results
    document.getElementById('results').classList.remove('active');
    document.querySelector('.navigation').style.display = 'flex';
}

function submitToNetlify(data, personalityCode) {
    const formData = new FormData();
    formData.append('form-name', 'quiz-responses');
    formData.append('personality_type', personalityCode);
    formData.append('q1_life_stage', data.q1 || '');
    formData.append('q2_household', data.q2 || '');
    formData.append('q3_challenges', data.q3 ? data.q3.join(', ') : '');
    formData.append('q4_unexpected_money', data.q4 || '');
    formData.append('q5_bills', data.q5 || '');
    formData.append('q6_budget', data.q6 || '');
    formData.append('q7_shopping', data.q7 || '');
    formData.append('q8_satisfaction', data.q8 || '');
    formData.append('q9_saving_motivation', data.q9 || '');
    formData.append('q10_financial_future', data.q10 || '');
    formData.append('q11_decisions', data.q11 || '');
    formData.append('q12_resonates', data.q12 || '');
    formData.append('timestamp', new Date().toISOString());

    fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    });
}

// Feedback form submission
document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', submitFeedback);
    }
});

function submitFeedback(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('form-name', 'feedback');
    formData.append('accuracy', document.getElementById('accuracy').value);
    formData.append('clarity', document.getElementById('clarity').value);
    formData.append('comments', document.getElementById('comments').value);
    formData.append('timestamp', new Date().toISOString());
    
    fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    })
    .then(() => {
    alert('Thank you for your feedback!');
    document.getElementById('feedbackForm').reset();
    
    // Show personalization section after feedback is submitted
    showPersonalization();
})
    .catch(() => {
        alert('Thanks! Your feedback was submitted.');
    });
}
// Mini Quiz Personalization Functions
let selectedMiniQuizzes = new Set();

function showPersonalization() {
    document.getElementById('personalizationSection').classList.add('active');
    
    // Add event listeners for mini quiz cards
    document.querySelectorAll('.mini-quiz-card').forEach(card => {
        card.addEventListener('click', () => {
            const quizId = card.dataset.quiz;
            
            if (selectedMiniQuizzes.has(quizId)) {
                selectedMiniQuizzes.delete(quizId);
                card.classList.remove('selected');
            } else {
                selectedMiniQuizzes.add(quizId);
                card.classList.add('selected');
            }
            
            updatePersonalizationUI();
        });
    });

    // Select all button
    document.getElementById('selectAllQuizzes').addEventListener('click', () => {
        document.querySelectorAll('.mini-quiz-card').forEach(card => {
            const quizId = card.dataset.quiz;
            selectedMiniQuizzes.add(quizId);
            card.classList.add('selected');
        });
        updatePersonalizationUI();
    });

    // Clear all button
    document.getElementById('clearAllQuizzes').addEventListener('click', () => {
        selectedMiniQuizzes.clear();
        document.querySelectorAll('.mini-quiz-card').forEach(card => {
            card.classList.remove('selected');
        });
        updatePersonalizationUI();
    });

    // Start quizzes button
    document.getElementById('startMiniQuizzes').addEventListener('click', () => {
        if (selectedMiniQuizzes.size > 0) {
            // Here you would redirect to the first selected quiz
            // For now, we'll just show an alert
            alert(`Starting ${selectedMiniQuizzes.size} mini quiz(es): ${Array.from(selectedMiniQuizzes).join(', ')}`);
            
            // In your actual implementation, you could do something like:
            // window.location.href = `/quiz/${Array.from(selectedMiniQuizzes)[0]}`;
            // or store the selection and proceed to the first quiz
        }
    });

    // Skip button
    document.getElementById('skipPersonalization').addEventListener('click', () => {
        // Handle skip action - maybe go back to results or main page
        alert('Skipping personalization - you can always come back for more insights!');
    });
}

function updatePersonalizationUI() {
    const count = selectedMiniQuizzes.size;
    document.getElementById('selectedQuizCount').textContent = count;
    
    const startButton = document.getElementById('startMiniQuizzes');
    startButton.disabled = count === 0;
    
    if (count > 0) {
        startButton.textContent = count === 1 ? 
            '🚀 Start My Mini Quiz' : 
            `🚀 Start My ${count} Mini Quizzes`;
    } else {
        startButton.textContent = '🚀 Start My Mini Quizzes';
    }
}
// Initialize quiz
showSection(1);