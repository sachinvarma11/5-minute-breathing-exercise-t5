const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const timerDisplay = document.querySelector('.timer');
const breathingText = document.querySelector('.breathing-text');

// Create audio elements
const breathInSound = new Audio('breathe-in-87397.mp3');
const breathOutSound = new Audio('breath-out-242642.mp3');

let isRunning = false;
let isPaused = false;
let timeLeft = 300; // 5 minutes in seconds
let intervalId = null;
let breathingInterval = null;
let breathingTimeouts = [];

const sessionStats = {
    totalSessions: 0,
    totalMinutes: 0,
    longestStreak: 0,
    currentStreak: 0,
    lastSession: null
};

// Add motivational quotes array
const motivationalQuotes = [
    "Breathe in peace, breathe out stress",
    "Each breath brings you closer to calm",
    "You're taking great care of yourself",
    "Feel your mind becoming clearer",
    "Let go of what doesn't serve you",
    "You're getting stronger with each breath",
    "Embrace the peaceful moment",
    "Your mind is becoming calmer",
    "You're doing great!",
    "Feel the tension melting away",
    "Peace begins with this moment",
    "You're creating positive change"
];

function loadStats() {
    const savedStats = localStorage.getItem('meditationStats');
    if (savedStats) {
        Object.assign(sessionStats, JSON.parse(savedStats));
    }
}

function saveStats() {
    localStorage.setItem('meditationStats', JSON.stringify(sessionStats));
}

function updateSessionStats() {
    const today = new Date().toISOString().split('T')[0]; // Use ISO date format
    
    sessionStats.totalSessions++;
    sessionStats.totalMinutes += 5;
    
    if (!sessionStats.lastSession) {
        sessionStats.currentStreak = 1;
    } else {
        const lastDate = new Date(sessionStats.lastSession);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Consecutive day
            sessionStats.currentStreak++;
        } else if (diffDays === 0) {
            // Same day, don't increase streak
        } else {
            // Streak broken
            sessionStats.currentStreak = 1;
        }
    }
    
    if (sessionStats.currentStreak > sessionStats.longestStreak) {
        sessionStats.longestStreak = sessionStats.currentStreak;
    }
    
    sessionStats.lastSession = today;
    saveStats();
}

function stopAllSounds() {
    breathInSound.pause();
    breathInSound.currentTime = 0;
    breathOutSound.pause();
    breathOutSound.currentTime = 0;
}

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function breathingCycle() {
    // Breath in for 4 seconds
    breathingText.textContent = 'Breathe In...';
    breathInSound.play();
    
    let timeout1 = setTimeout(() => {
        if (!isPaused) {
            // Hold for 4 seconds
            breathingText.textContent = 'Hold...';
            
            let timeout2 = setTimeout(() => {
                if (!isPaused) {
                    // Breathe out for 4 seconds
                    breathingText.textContent = 'Breathe Out...';
                    breathOutSound.play();
                    
                    let timeout3 = setTimeout(() => {
                        if (!isPaused) {
                            // Hold for 4 seconds
                            breathingText.textContent = 'Hold...';
                        }
                    }, 4000);
                    breathingTimeouts.push(timeout3);
                }
            }, 4000);
            breathingTimeouts.push(timeout2);
        }
    }, 4000);
    breathingTimeouts.push(timeout1);
}

function clearAllTimeouts() {
    breathingTimeouts.forEach(timeout => clearTimeout(timeout));
    breathingTimeouts = [];
}

function showStats() {
    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';
    
    // Update session stats before showing
    updateSessionStats();
    
    statsContainer.innerHTML = `
        <h2>Session Complete!</h2>
        <div class="achievement-card">
            <div class="achievement-icon">🌟</div>
            <div class="achievement-text">
                <h3>5 Minutes of Mindfulness</h3>
                <p>You've taken a wonderful step towards inner peace</p>
            </div>
        </div>
        <button class="close-stats">Continue</button>
    `;

    document.querySelector('.container').appendChild(statsContainer);

    const closeButton = statsContainer.querySelector('.close-stats');
    const closeHandler = () => {
        statsContainer.remove();
        closeButton.removeEventListener('click', closeHandler);
    };
    closeButton.addEventListener('click', closeHandler);
}

function resetMeditation() {
    clearInterval(intervalId);
    clearInterval(breathingInterval);
    clearAllTimeouts();
    stopAllSounds();
    isRunning = false;
    isPaused = false;
    timeLeft = 300;
    startButton.textContent = 'Start Meditation';
    breathingText.textContent = 'Click Start to begin';
    updateTimer();
    stopButton.disabled = true;
    
    // Reset progress bar and percentage
    const progressFill = document.querySelector('.progress-fill');
    const progressTime = document.querySelector('.progress-time');
    if (progressFill) progressFill.style.width = '0%';
    if (progressTime) progressTime.textContent = '0%';
    
    showStats();
}

function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 3 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particlesContainer.appendChild(particle);
    }
}

// Add this function for celebration animation
function showCelebration() {
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.innerHTML = '🎉';
    document.body.appendChild(celebration);
    
    setTimeout(() => {
        celebration.remove();
    }, 1000);
}

// Update the progress function
function updateProgress() {
    const progressPercent = ((300 - timeLeft) / 300) * 100;
    const progressFill = document.querySelector('.progress-fill');
    const progressTime = document.querySelector('.progress-time');
    const quoteElement = document.querySelector('.motivation-text');
    
    // Update progress bar
    progressFill.style.width = `${progressPercent}%`;
    progressTime.textContent = `${Math.round(progressPercent)}%`;
    
    // Update quote every 5 seconds
    if (timeLeft % 5 === 0) {
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        quoteElement.textContent = randomQuote;
        quoteElement.classList.add('fade-in');
        setTimeout(() => quoteElement.classList.remove('fade-in'), 1000);
    }
}

let audioContext;
let audioInitialized = false;

// Function to initialize audio
function initializeAudio() {
    if (audioInitialized) return;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create audio sources
        const breathInSource = audioContext.createMediaElementSource(breathInSound);
        const breathOutSource = audioContext.createMediaElementSource(breathOutSound);
        
        // Connect to destination
        breathInSource.connect(audioContext.destination);
        breathOutSource.connect(audioContext.destination);
        
        audioInitialized = true;
    } catch (error) {
        console.error('Audio initialization failed:', error);
    }
}

// Update the start button click handler
startButton.addEventListener('click', () => {
    // Initialize audio on first interaction
    if (!audioInitialized) {
        initializeAudio();
    }
    
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    if (!isRunning) {
        // Starting new meditation
        isRunning = true;
        isPaused = false;
        startButton.textContent = 'Pause Meditation';
        stopButton.disabled = false;
        
        breathingCycle();
        breathingInterval = setInterval(breathingCycle, 16000);
        
        intervalId = setInterval(() => {
            timeLeft--;
            updateTimer();
            updateProgress();
            
            if (timeLeft <= 0) {
                resetMeditation();
                breathingText.textContent = 'Meditation Complete';
            }
        }, 1000);
    } else if (!isPaused) {
        // Pausing meditation
        isPaused = true;
        clearInterval(intervalId);
        clearInterval(breathingInterval);
        stopAllSounds();
        startButton.textContent = 'Resume Meditation';
        breathingText.textContent = 'Meditation Paused';
    } else {
        // Resuming meditation
        isPaused = false;
        startButton.textContent = 'Pause Meditation';
        breathingText.textContent = 'Resuming...';
        
        breathingCycle();
        breathingInterval = setInterval(breathingCycle, 16000);
        
        intervalId = setInterval(() => {
            timeLeft--;
            updateTimer();
            updateProgress();
            
            if (timeLeft <= 0) {
                resetMeditation();
                breathingText.textContent = 'Meditation Complete';
            }
        }, 1000);
    }
});

stopButton.addEventListener('click', () => {
    resetMeditation();
});

document.addEventListener('DOMContentLoaded', () => {
    setLoadingState(true);
    Promise.all([
        new Promise(resolve => breathInSound.addEventListener('canplaythrough', resolve)),
        new Promise(resolve => breathOutSound.addEventListener('canplaythrough', resolve))
    ]).then(() => {
        setLoadingState(false);
    });
    loadStats();
    updateTimer();
    createParticles();

    // Add Intersection Observer for gallery
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe gallery
    const gallery = document.querySelector('.meditation-gallery');
    observer.observe(gallery);

    animateBenefitBars();
    initAudio();
    addTouchSupport();

    // Prevent default touch behaviors
    document.addEventListener('touchstart', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            e.preventDefault();
        }
    }, { passive: false });

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}); 

// Add cleanup function
function cleanup() {
    clearInterval(intervalId);
    clearInterval(breathingInterval);
    clearAllTimeouts();
    stopAllSounds();
}

// Add before unload listener
window.addEventListener('beforeunload', cleanup); 

// Add function to animate benefit bars
function animateBenefitBars() {
    const bars = {
        stressBar: 85,
        hrvBar: 75,
        focusBar: 65,
        bpBar: 70,
        anxietyBar: 80,
        immuneBar: 60,
        emotionalBar: 75,
        inflammationBar: 55,
        energyBar: 70,
        sleepBar: 65
    };

    Object.entries(bars).forEach(([barId, value]) => {
        const bar = document.getElementById(barId);
        if (bar) {
            setTimeout(() => {
                bar.style.width = `${value}%`;
            }, 100);
        }
    });
} 

function initAudio() {
    // iOS requires user interaction to play audio
    document.addEventListener('touchstart', initializeAudioContext, { once: true });
    
    breathInSound.addEventListener('error', () => {
        console.error('Error loading breath-in audio');
        handleAudioError();
    });
    
    breathOutSound.addEventListener('error', () => {
        console.error('Error loading breath-out audio');
        handleAudioError();
    });
}

function initializeAudioContext() {
    // Create AudioContext for iOS
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Connect audio elements to context
    const breathInSource = audioContext.createMediaElementSource(breathInSound);
    const breathOutSource = audioContext.createMediaElementSource(breathOutSound);
    
    breathInSource.connect(audioContext.destination);
    breathOutSource.connect(audioContext.destination);
}

function handleAudioError() {
    // Fallback for audio issues
    const fallbackText = document.createElement('div');
    fallbackText.className = 'audio-fallback';
    fallbackText.textContent = 'Audio unavailable. Follow the visual cues.';
    document.querySelector('.container').appendChild(fallbackText);
}

// Call in DOMContentLoaded
document.addEventListener('DOMContentLoaded', initAudio); 

// Add touch support for mobile
function addTouchSupport() {
    const container = document.querySelector('.container');
    let touchStartY;
    
    container.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        container.classList.add('touch-active');
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevent unwanted scrolling
    }, { passive: false });
    
    container.addEventListener('touchend', () => {
        container.classList.remove('touch-active');
    });
    
    // Prevent double-tap zoom on iOS
    document.addEventListener('dblclick', (e) => {
        e.preventDefault();
    }, { passive: false });
}

document.addEventListener('DOMContentLoaded', addTouchSupport); 

function setLoadingState(isLoading) {
    const startButton = document.getElementById('startButton');
    if (isLoading) {
        startButton.disabled = true;
        startButton.textContent = 'Loading...';
    } else {
        startButton.disabled = false;
        startButton.textContent = 'Start Meditation';
    }
}
