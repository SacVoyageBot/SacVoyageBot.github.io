// Инициализируем WebApp
let tg = window.Telegram.WebApp;

// Расширяем приложение на весь экран (опционально)
tg.expand();

// Получаем объект пользователя
let user = tg.initDataUnsafe?.user;

// Обработчик кнопки
document.getElementById('btn-data').addEventListener('click', () => {
    if (user) {
        let userInfo = `
            <p>Имя: ${user.first_name}</p>
            <p>Фамилия: ${user.last_name || 'Не указана'}</p>
            <p>Username: @${user.username || 'Не указан'}</p>
            <p>ID: ${user.id}</p>
        `;
        document.getElementById('user-data').innerHTML = userInfo;
    } else {
        document.getElementById('user-data').innerHTML = '<p>Данные пользователя недоступны.</p>';
    }
});

// Пример отправки данных обратно в бот
function sendDataToBot(data) {
    tg.sendData(JSON.stringify(data));
    // После отправки данных Telegram закроет Web App
    // tg.close();
}

// Вешаем эту функцию на другую кнопку, если нужно