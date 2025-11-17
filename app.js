let tg = window.Telegram.WebApp;
tg.expand();

// Данные экскурсии
const tourData = {
    title: "Исторический центр города",
    character: {
        name: "Иван-путеводитель",
        image: "character.png"
    },
    slides: [
        {
            image: "slide1.jpg",
            caption: "Главная площадь города",
            text: "Добро пожаловать на нашу экскурсию! Перед вами главная площадь нашего города, которая была основана в 18 веке. Здесь происходили важнейшие исторические события.",
            audio: "audio/slide1.mp3"
        },
        {
            image: "slide2.jpg", 
            caption: "Старинный собор",
            text: "Обратите внимание на этот великолепный собор. Он был построен в 1754 году и является прекрасным образцом барокко. Высота колокольни составляет 65 метров!",
            audio: "audio/slide2.mp3"
        },
        {
            image: "slide3.jpg",
            caption: "Городская набережная",
            text: "А вот и наша прекрасная набережная. Здесь любят гулять как местные жители, так и туристы. Особенно красиво здесь вечером, когда зажигаются огни.",
            audio: "audio/slide3.mp3"
        }
        // Добавьте больше слайдов по необходимости
    ]
};

let currentSlide = 0;
let speechSynthesis = null;
let isPlaying = false;

// Инициализация приложения
function initApp() {
    tg.ready();
    showSlide(0);
    setupSpeechSynthesis();
    
    // Скрываем индикатор загрузки
    document.getElementById('loading').classList.add('hidden');
}

// Показать слайд
function showSlide(index) {
    if (index < 0 || index >= tourData.slides.length) return;
    
    currentSlide = index;
    const slide = tourData.slides[index];
    
    // Обновляем визуальную часть
    document.getElementById('mainImage').src = slide.image;
    document.getElementById('imageCaption').textContent = slide.caption;
    
    // Обновляем текст
    document.getElementById('dialogueText').textContent = slide.text;
    
    // Обновляем прогресс
    updateProgress();
    
    // Останавливаем текущее воспроизведение
    stopSpeech();
}

// Настройка синтеза речи
function setupSpeechSynthesis() {
    speechSynthesis = window.speechSynthesis;
    
    // Проверяем поддержку Web Speech API
    if (!speechSynthesis) {
        console.warn('Web Speech API не поддерживается');
        document.getElementById('playBtn').disabled = true;
        return;
    }
    
    // Получаем доступные голоса (может потребоваться время для загрузки)
    speechSynthesis.onvoiceschanged = function() {
        console.log('Голоса загружены');
    };
}

// Озвучивание текста
function toggleSpeech() {
    if (isPlaying) {
        pauseSpeech();
    } else {
        playSpeech();
    }
}

function playSpeech() {
    if (isPlaying) return;
    
    const slide = tourData.slides[currentSlide];
    const utterance = new SpeechSynthesisUtterance(slide.text);
    
    // Настройки голоса
    utterance.rate = 0.9; // Скорость
    utterance.pitch = 1;  // Тон
    utterance.volume = 1; // Громкость
    
    // Выбираем русский голос если доступен
    const voices = speechSynthesis.getVoices();
    const russianVoice = voices.find(voice => voice.lang.includes('ru'));
    if (russianVoice) {
        utterance.voice = russianVoice;
    }
    
    utterance.onstart = function() {
        isPlaying = true;
        document.getElementById('playBtn').textContent = '⏸ Пауза';
    };
    
    utterance.onend = function() {
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶ Озвучить';
    };
    
    utterance.onerror = function(event) {
        console.error('Ошибка воспроизведения:', event);
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶ Озвучить';
        alert('Не удалось воспроизвести аудио. Проверьте поддержку браузером.');
    };
    
    speechSynthesis.speak(utterance);
}

function pauseSpeech() {
    if (speechSynthesis.speaking) {
        speechSynthesis.pause();
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶ Продолжить';
    }
}

function stopSpeech() {
    speechSynthesis.cancel();
    isPlaying = false;
    document.getElementById('playBtn').textContent = '▶ Озвучить';
}

// Навигация
function nextSlide() {
    if (currentSlide < tourData.slides.length - 1) {
        showSlide(currentSlide + 1);
    } else {
        // Экскурсия завершена
        tg.showPopup({
            title: 'Экскурсия завершена',
            message: 'Спасибо за участие! Надеемся, вам понравилось.',
            buttons: [{ type: 'ok' }]
        });
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        showSlide(currentSlide - 1);
    }
}

function nextDialogue() {
    nextSlide();
}

// Обновление прогресса
function updateProgress() {
    const progress = ((currentSlide + 1) / tourData.slides.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = 
        `${currentSlide + 1}/${tourData.slides.length}`;
}

// Обработчики клавиш для удобства
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        prevSlide();
    } else if (event.key === 'ArrowRight') {
        nextSlide();
    } else if (event.key === ' ') {
        event.preventDefault();
        toggleSpeech();
    }
});

// Инициализация при загрузке
window.addEventListener('load', initApp);

// Интеграция с Telegram
function sendTourProgress() {
    // Отправляем прогресс обратно в бота
    tg.sendData(JSON.stringify({
        action: 'tour_progress',
        current_slide: currentSlide,
        total_slides: tourData.slides.length,
        tour_title: tourData.title
    }));
}

// Сохраняем прогресс при закрытии
window.addEventListener('beforeunload', sendTourProgress);