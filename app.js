let tg = window.Telegram.WebApp;
let currentSlide = 0;
let speechSynthesis = null;
let isPlaying = false;

// Упрощенные данные для тестирования (без внешних файлов)
const tourData = {
    title: "Тестовая экскурсия",
    character: {
        name: "Гид-экскурсовод",
        image: "https://via.placeholder.com/150/0088cc/ffffff?text=Гид"
    },
    slides: [
        {
            image: "https://via.placeholder.com/800x400/ff6b6b/ffffff?text=Площадь+города",
            caption: "Главная площадь",
            text: "Добро пожаловать на нашу экскурсию! Это главная площадь нашего города.",
            audio: ""
        },
        {
            image: "https://via.placeholder.com/800x400/4ecdc4/ffffff?text=Исторический+собор", 
            caption: "Старинный собор",
            text: "Перед вами великолепный собор, построенный в 18 веке в стиле барокко.",
            audio: ""
        },
        {
            image: "https://via.placeholder.com/800x400/45b7d1/ffffff?text=Городская+набережная",
            caption: "Речная набережная",
            text: "А это наша красивая набережная, где любят гулять жители и гости города.",
            audio: ""
        }
    ]
};

// Инициализация приложения
function initApp() {
    console.log('Инициализация приложения...');
    
    // Показываем индикатор загрузки
    document.getElementById('loading').classList.remove('hidden');
    
    // Инициализируем Telegram Web App
    if (tg) {
        tg.ready();
        tg.expand();
        console.log('Telegram Web App инициализирован');
    }
    
    // Загружаем первый слайд
    setTimeout(() => {
        showSlide(0);
        setupSpeechSynthesis();
        
        // Скрываем индикатор загрузки
        document.getElementById('loading').classList.add('hidden');
        console.log('Приложение загружено');
    }, 500);
}

// Показать слайд
function showSlide(index) {
    if (index < 0 || index >= tourData.slides.length) return;
    
    currentSlide = index;
    const slide = tourData.slides[index];
    
    console.log('Показываем слайд:', index);
    
    // Обновляем визуальную часть
    const mainImage = document.getElementById('mainImage');
    mainImage.onload = function() {
        console.log('Изображение загружено');
    };
    mainImage.onerror = function() {
        console.error('Ошибка загрузки изображения');
        this.src = 'https://via.placeholder.com/800x400/cccccc/666666?text=Изображение+не+загружено';
    };
    mainImage.src = slide.image;
    
    document.getElementById('imageCaption').textContent = slide.caption;
    
    // Обновляем текст
    document.getElementById('dialogueText').textContent = slide.text;
    
    // Обновляем персонажа
    document.getElementById('characterName').textContent = tourData.character.name;
    document.getElementById('characterImage').src = tourData.character.image;
    
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
    
    console.log('Web Speech API доступен');
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
    
    try {
        const utterance = new SpeechSynthesisUtterance(slide.text);
        
        // Настройки голоса
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Выбираем русский голос если доступен
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            const russianVoice = voices.find(voice => voice.lang.includes('ru'));
            if (russianVoice) {
                utterance.voice = russianVoice;
            }
        }
        
        utterance.onstart = function() {
            isPlaying = true;
            document.getElementById('playBtn').textContent = '⏸ Пауза';
            console.log('Начало воспроизведения');
        };
        
        utterance.onend = function() {
            isPlaying = false;
            document.getElementById('playBtn').textContent = '▶ Озвучить';
            console.log('Воспроизведение завершено');
        };
        
        utterance.onerror = function(event) {
            console.error('Ошибка воспроизведения:', event);
            isPlaying = false;
            document.getElementById('playBtn').textContent = '▶ Озвучить';
            // Не показываем алерт, чтобы не раздражать пользователя
        };
        
        speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Ошибка при создании utterance:', error);
        isPlaying = false;
    }
}

function pauseSpeech() {
    if (speechSynthesis.speaking) {
        speechSynthesis.pause();
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶ Продолжить';
    }
}

function stopSpeech() {
    if (speechSynthesis) {
        speechSynthesis.cancel();
    }
    isPlaying = false;
    document.getElementById('playBtn').textContent = '▶ Озвучить';
}

// Навигация
function nextSlide() {
    if (currentSlide < tourData.slides.length - 1) {
        showSlide(currentSlide + 1);
    } else {
        // Экскурсия завершена
        if (tg && tg.showPopup) {
            tg.showPopup({
                title: 'Экскурсия завершена',
                message: 'Спасибо за участие! Надеемся, вам понравилось.',
                buttons: [{ type: 'ok' }]
            });
        } else {
            alert('Экскурсия завершена! Спасибо за участие!');
        }
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

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, запускаем инициализацию...');
    initApp();
});

// Обработка ошибок
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    document.getElementById('loading').classList.add('hidden');
});
