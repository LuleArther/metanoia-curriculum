/**
 * Quiz functionality for the Metanoia Curriculum
 * Handles loading quiz questions, rendering quizzes, and scoring results
 */

/**
 * Initialize quiz functionality
 * @param {string} quizId - Unique identifier for the quiz
 * @param {string} containerId - ID of the container element to render the quiz
 */
function initQuiz(quizId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Quiz container with ID ${containerId} not found`);
        return;
    }
    
    // Check if quiz was already taken
    const existingResult = getQuizResult(quizId);
    if (existingResult) {
        renderQuizResult(container, existingResult);
        return;
    }
    
    // Fetch quiz questions
    fetch('../assets/data/quiz-questions.json')
        .then(response => response.json())
        .then(allQuizzes => {
            const quizData = allQuizzes.find(q => q.id === quizId);
            if (!quizData) {
                throw new Error(`Quiz with ID ${quizId} not found`);
            }
            renderQuiz(container, quizData);
        })
        .catch(error => {
            console.error('Error loading quiz:', error);
            container.innerHTML = `
                <div class="error-message">
                    <p>Sorry, there was an error loading the quiz. Please try again later.</p>
                </div>
            `;
        });
}

/**
 * Render quiz questions
 * @param {HTMLElement} container - Container element
 * @param {object} quizData - Quiz data object
 */
function renderQuiz(container, quizData) {
    // Create quiz structure
    container.innerHTML = `
        <div class="quiz-header">
            <h2>${quizData.title}</h2>
            <p class="quiz-description">${quizData.description}</p>
        </div>
        <form id="quiz-form-${quizData.id}" class="quiz-form">
            <div class="questions-container">
                ${quizData.questions.map((question, index) => renderQuestion(question, index)).join('')}
            </div>
            <div class="quiz-actions">
                <button type="submit" class="btn-primary">Submit Answers</button>
            </div>
        </form>
    `;
    
    // Set up form submission
    const form = document.getElementById(`quiz-form-${quizData.id}`);
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitQuiz(quizData, form, container);
    });
}

/**
 * Render a quiz question
 * @param {object} question - Question data object
 * @param {number} index - Question index
 * @returns {string} HTML for the question
 */
function renderQuestion(question, index) {
    const questionId = `question-${index}`;
    
    let optionsHTML = '';
    
    // Render different question types
    switch (question.type) {
        case 'multiple-choice':
            optionsHTML = question.options.map((option, optIndex) => `
                <div class="option">
                    <input type="radio" id="q${index}-opt${optIndex}" name="${questionId}" value="${optIndex}" required>
                    <label for="q${index}-opt${optIndex}">${option}</label>
                </div>
            `).join('');
            break;
            
        case 'checkbox':
            optionsHTML = question.options.map((option, optIndex) => `
                <div class="option">
                    <input type="checkbox" id="q${index}-opt${optIndex}" name="${questionId}" value="${optIndex}">
                    <label for="q${index}-opt${optIndex}">${option}</label>
                </div>
            `).join('');
            break;
            
        case 'true-false':
            optionsHTML = `
                <div class="option">
                    <input type="radio" id="q${index}-true" name="${questionId}" value="true" required>
                    <label for="q${index}-true">True</label>
                </div>
                <div class="option">
                    <input type="radio" id="q${index}-false" name="${questionId}" value="false" required>
                    <label for="q${index}-false">False</label>
                </div>
            `;
            break;
            
        case 'matching':
            optionsHTML = `
                <div class="matching-container">
                    ${question.pairs.map((pair, pairIndex) => `
                        <div class="matching-pair">
                            <div class="matching-item">${pair.item}</div>
                            <select name="${questionId}-${pairIndex}" required>
                                <option value="">-- Select Match --</option>
                                ${question.pairs.map((p, i) => `
                                    <option value="${i}">${p.match}</option>
                                `).join('')}
                            </select>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'short-answer':
            optionsHTML = `
                <textarea name="${questionId}" rows="3" placeholder="Enter your answer" required></textarea>
            `;
            break;
    }
    
    return `
        <div class="question" data-type="${question.type}">
            <div class="question-text">${index + 1}. ${question.text}</div>
            <div class="options-container">
                ${optionsHTML}
            </div>
        </div>
    `;
}

/**
 * Submit quiz answers and calculate score
 * @param {object} quizData - Quiz data object
 * @param {HTMLFormElement} form - Quiz form element
 * @param {HTMLElement} container - Container element
 */
function submitQuiz(quizData, form, container) {
    const formData = new FormData(form);
    const answers = [];
    const correctAnswers = [];
    let score = 0;
    
    // Process each question
    quizData.questions.forEach((question, index) => {
        const questionId = `question-${index}`;
        
        // Handle different question types
        switch (question.type) {
            case 'multiple-choice':
                const mcAnswer = formData.get(questionId);
                const userMcAnswer = mcAnswer !== null ? parseInt(mcAnswer) : null;
                answers.push(userMcAnswer);
                correctAnswers.push(question.correctAnswer);
                if (userMcAnswer === question.correctAnswer) {
                    score++;
                }
                break;
                
            case 'checkbox':
                const cbValues = formData.getAll(questionId).map(v => parseInt(v));
                answers.push(cbValues);
                correctAnswers.push(question.correctAnswers);
                // Check if arrays are identical
                const correctCb = question.correctAnswers.length === cbValues.length && 
                    question.correctAnswers.every(val => cbValues.includes(val));
                if (correctCb) {
                    score++;
                }
                break;
                
            case 'true-false':
                const tfAnswer = formData.get(questionId) === 'true';
                answers.push(tfAnswer);
                correctAnswers.push(question.correctAnswer);
                if (tfAnswer === question.correctAnswer) {
                    score++;
                }
                break;
                
            case 'matching':
                const matchingAnswers = [];
                let allCorrect = true;
                
                for (let i = 0; i < question.pairs.length; i++) {
                    const pairAnswer = parseInt(formData.get(`${questionId}-${i}`));
                    matchingAnswers.push(pairAnswer);
                    if (pairAnswer !== i) {
                        allCorrect = false;
                    }
                }
                
                answers.push(matchingAnswers);
                correctAnswers.push(Array.from({ length: question.pairs.length }, (_, i) => i));
                if (allCorrect) {
                    score++;
                }
                break;
                
            case 'short-answer':
                const saAnswer = formData.get(questionId);
                answers.push(saAnswer);
                // For short answers, we don't auto-grade
                correctAnswers.push(null);
                break;
        }
    });
    
    // Calculate percentage score
    const totalQuestions = quizData.questions.filter(q => q.type !== 'short-answer').length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    
    // Create result object
    const result = {
        quizId: quizData.id,
        title: quizData.title,
        score,
        totalQuestions,
        percentage,
        answers,
        correctAnswers,
        timestamp: Date.now()
    };
    
    // Save result to local storage
    saveQuizResult(quizData.id, result);
    
    // Render result
    renderQuizResult(container, result);
    
    // Update module progress if this is a module quiz
    if (quizData.moduleNumber) {
        const currentProgress = getModuleProgress(quizData.moduleNumber);
        saveModuleProgress(quizData.moduleNumber, Math.max(currentProgress, 25)); // Minimum 25% progress for taking quiz
    }
}

/**
 * Render quiz results
 * @param {HTMLElement} container - Container element
 * @param {object} result - Quiz result object
 */
function renderQuizResult(container, result) {
    // Fetch quiz data to show questions and correct answers
    fetch('../assets/data/quiz-questions.json')
        .then(response => response.json())
        .then(allQuizzes => {
            const quizData = allQuizzes.find(q => q.id === result.quizId);
            if (!quizData) {
                throw new Error(`Quiz with ID ${result.quizId} not found`);
            }
            
            let resultClass = 'average';
            if (result.percentage >= 80) resultClass = 'good';
            if (result.percentage < 50) resultClass = 'poor';
            
            container.innerHTML = `
                <div class="quiz-result">
                    <div class="result-header">
                        <h2>Quiz Results: ${result.title}</h2>
                        <div class="score-display ${resultClass}">
                            <div class="score-circle">
                                <span class="score-percentage">${result.percentage}%</span>
                            </div>
                            <div class="score-text">
                                <p>You got <strong>${result.score}/${result.totalQuestions}</strong> questions correct</p>
                                <p class="score-date">Taken on ${new Date(result.timestamp).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="result-details">
                        <h3>Review Your Answers</h3>
                        <div class="questions-review">
                            ${quizData.questions.map((question, index) => 
                                renderQuestionResult(question, index, result.answers[index], result.correctAnswers[index])
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="quiz-actions">
                        <button id="retake-quiz" class="btn-secondary">Retake Quiz</button>
                    </div>
                </div>
            `;
            
            // Set up retake button
            document.getElementById('retake-quiz').addEventListener('click', () => {
                // Remove previous result
                removeFromStorage(`${STORAGE_KEYS.QUIZ_RESULTS}.${result.quizId}`);
                // Re-initialize quiz
                renderQuiz(container, quizData);
            });
        })
        .catch(error => {
            console.error('Error loading quiz for results:', error);
            container.innerHTML = `
                <div class="error-message">
                    <p>Sorry, there was an error loading the quiz results. Please try again later.</p>
                </div>
            `;
        });
}

/**
 * Render a question with the user's answer and correct answer
 * @param {object} question - Question data
 * @param {number} index - Question index
 * @param {any} userAnswer - User's answer
 * @param {any} correctAnswer - Correct answer
 * @returns {string} HTML for the question result
 */
function renderQuestionResult(question, index, userAnswer, correctAnswer) {
    let answerHTML = '';
    let isCorrect = false;
    
    // Display different question types
    switch (question.type) {
        case 'multiple-choice':
            isCorrect = userAnswer === correctAnswer;
            answerHTML = `
                <div class="options-result">
                    ${question.options.map((option, optIndex) => `
                        <div class="option ${optIndex === userAnswer ? 'user-selected' : ''} ${optIndex === correctAnswer ? 'correct' : ''}">
                            <span class="option-marker">${optIndex === userAnswer ? '✓' : ''}</span>
                            <span class="option-text">${option}</span>
                            ${optIndex === correctAnswer ? '<span class="correct-marker">Correct</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'checkbox':
            isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort());
            answerHTML = `
                <div class="options-result">
                    ${question.options.map((option, optIndex) => `
                        <div class="option ${userAnswer.includes(optIndex) ? 'user-selected' : ''} ${correctAnswer.includes(optIndex) ? 'correct' : ''}">
                            <span class="option-marker">${userAnswer.includes(optIndex) ? '✓' : ''}</span>
                            <span class="option-text">${option}</span>
                            ${correctAnswer.includes(optIndex) ? '<span class="correct-marker">Correct</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'true-false':
            isCorrect = userAnswer === correctAnswer;
            answerHTML = `
                <div class="options-result">
                    <div class="option ${userAnswer === true ? 'user-selected' : ''} ${correctAnswer === true ? 'correct' : ''}">
                        <span class="option-marker">${userAnswer === true ? '✓' : ''}</span>
                        <span class="option-text">True</span>
                        ${correctAnswer === true ? '<span class="correct-marker">Correct</span>' : ''}
                    </div>
                    <div class="option ${userAnswer === false ? 'user-selected' : ''} ${correctAnswer === false ? 'correct' : ''}">
                        <span class="option-marker">${userAnswer === false ? '✓' : ''}</span>
                        <span class="option-text">False</span>
                        ${correctAnswer === false ? '<span class="correct-marker">Correct</span>' : ''}
                    </div>
                </div>
            `;
            break;
            
        case 'matching':
            isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
            answerHTML = `
                <div class="matching-result">
                    ${question.pairs.map((pair, pairIndex) => {
                        const selectedIndex = userAnswer[pairIndex];
                        const selectedMatch = question.pairs[selectedIndex]?.match || 'No selection';
                        return `
                            <div class="matching-pair ${selectedIndex === pairIndex ? 'correct' : 'incorrect'}">
                                <div class="matching-item">${pair.item}</div>
                                <div class="matching-arrow">→</div>
                                <div class="user-match">${selectedMatch}</div>
                                ${selectedIndex !== pairIndex ? `
                                    <div class="correct-match">
                                        <span class="correct-label">Correct:</span>
                                        <span>${pair.match}</span>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            break;
            
        case 'short-answer':
            // Short answers aren't auto-graded, just show what the user entered
            answerHTML = `
                <div class="short-answer-result">
                    <div class="user-answer">
                        <label>Your answer:</label>
                        <div class="answer-text">${userAnswer || 'No answer provided'}</div>
                    </div>
                    ${question.sampleAnswer ? `
                        <div class="sample-answer">
                            <label>Sample answer:</label>
                            <div class="answer-text">${question.sampleAnswer}</div>
                        </div>
                    ` : ''}
                </div>
            `;
            // No automatic correct/incorrect for short answers
            isCorrect = null;
            break;
    }
    
    // Determine the result class
    let resultClass = '';
    if (isCorrect === true) resultClass = 'correct';
    else if (isCorrect === false) resultClass = 'incorrect';
    
    return `
        <div class="question-result ${resultClass}">
            <div class="question-text">${index + 1}. ${question.text}</div>
            ${answerHTML}
            ${question.explanation ? `
                <div class="question-explanation">
                    <strong>Explanation:</strong> ${question.explanation}
                </div>
            ` : ''}
        </div>
    `;
}