// server.js
const express = require('express');
// Імпортуємо наші функції з файлу app.js
const db = require('./app.js');

const app = express();
const port = 3000; 
// Це дозволяє Express "розуміти" JSON, який буде приходити з front-end
app.use(express.json());
// Це дозволяє Express "розуміти" дані звичайних HTML-форм
app.use(express.urlencoded({ extended: true }));
// Це дозволяє нашому сайту (index.html) отримати доступ до сервера
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


// ЕНДПОІНТИ (Endpoints) - "Адреси" нашого API

// POST-запит на адресу http://localhost:3000/register
app.post('/register', async (req, res) => {
    try {
       
        const { nickname, email, password } = req.body;

        //  Перевіряємо, чи всі дані на місці
        if (!nickname || !email || !password) {
            return res.status(400).json({ success: false, error: 'Всі поля обов\'язкові' });
        }

        // Викликаємо нашу функцію з database.js
        const result = await db.registerUser(nickname, email, password);

        // 4. Відправляємо успішну відповідь
        res.status(201).json(result); // 201 = Created

    } catch (error) {
        // 5. Якщо сталася помилка (користувач існує, помилка БД тощо)
        res.status(400).json(error); // 400 = Bad Request
    }
});

// POST-запит на адресу http://localhost:3000/login
app.post('/login', async (req, res) => {
    try {
        // 1. Отримуємо дані
        const { email, password } = req.body;

        // 2. Перевіряємо дані
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email та пароль обов\'язкові' });
        }

        // 3. Викликаємо функцію логіну
        const result = await db.loginUser(email, password);

        // 4. Успіх
        res.status(200).json(result); // 200 = OK

    } catch (error) {
        // 5. Помилка (не знайдено, не той пароль)
        res.status(400).json(error);
    }
});

// запуск сервера
app.listen(port, () => {
    console.log(`🚀 Сервер запущено на http://localhost:${port}`);
    console.log('Тепер ви можете відкрити файл index.html у вашому браузері.');
});