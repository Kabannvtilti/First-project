//Режим VERBOSE потрібен для кращих повідомлень про помилки.
const sqlite3 = require('sqlite3').verbose();
// Імпортуємо 'bcrypt' для хешування паролів
const bcrypt = require('bcrypt');


// Чим вище число, тим надійніший хеш, але тим довше він генерується.
const saltRounds = 10;


// Ми створюємо новий екземпляр бази даних.
// 'users.db' - це назва файлу, де все буде зберігатися.
// Якщо файлу не існує, він буде автоматично створений.
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        // Помилка підключення
        console.error(err.message);
    } else {
        // Успішне підключення
        console.log('? Підключено до бази даних SQLite.');
    }
});


// db.serialize() гарантує, що команди виконаються послідовно, одна за одною.
db.serialize(() => {
    // Команда db.run() виконує SQL-запит.
    // Ми створюємо таблицю 'users', ЯКЩО ВОНА ЩЕ НЕ ІСНУЄ (IF NOT EXISTS).
    const sqlCreateTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `;

    // Запускаємо створення таблиці
    db.run(sqlCreateTable, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Таблиця "users" готова.');
        }
    });
});


// ФУНКЦІЯ РЕЄСТРАЦІЇ КОРИСТУВАЧА

/**
 * Реєструє нового користувача в базі даних.
 * @param {string} nickname - Нікнейм користувача.
 * @param {string} email - Email користувача.
 * @param {string} plainPassword - пароль (не хешований).
 */
function registerUser(nickname, email, plainPassword) {
    // 1. Хешуємо пароль
    bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
        if (err) {
            console.error('Помилка хешування пароля:', err);
            return;
        }

        // 2. Зберігаємо користувача в БД
       
        const sqlInsert = `INSERT INTO users (nickname, email, password_hash)`;

        db.run(sqlInsert, [nickname, email, hash], function (err) {
            if (err) {
                // 'UNIQUE constraint failed' означає, що такий email або нікнейм вже існує
                if (err.message.includes('UNIQUE constraint failed')) {
                    console.error('Помилка: Email або нікнейм вже зайняті.');
                } else {
                    console.error('Помилка при реєстрації:', err.message);
                }
            } else {
                // this.lastID - це 'id' щойно створеного користувача
                console.log(`?? Новий користувач створений! ID: ${this.lastID}`);
            }
        });
    });
}

// ФУНКЦІЯ ВХОДУ (ПЕРЕВІРКИ ПАРОЛЯ)

/**
 * Перевіряє логін та пароль користувача.
 * @param {string} email - Email, який вводить користувач.
 * @param {string} plainPassword - "Чистий" пароль, який він вводить.
 */
function loginUser(email, plainPassword) {

    // db.get() знаходить один рядок і повертає його.
    const sqlFind = `SELECT * FROM users WHERE email = ?`;

    db.get(sqlFind, [email], (err, user) => {
        if (err) {
            console.error('Помилка при пошуку користувача:', err.message);
            return;
        }

        
        if (!user) {
            console.log('Помилка входу: Користувача з таким email не знайдено.');
            return;
        }

      
        // хешуєм 'plainPassword' і порівнюєм результат з 'user.password_hash'.
        bcrypt.compare(plainPassword, user.password_hash, (err, result) => {
            if (err) {
                console.error('Помилка при порівнянні паролів:', err);
                return;
            }

            // 'result' - це 'true' або 'false'
            if (result) {
                console.log(`? Вхід успішний! Вітаємо, ${user.nickname}!`);
            } else {
                console.log('Помилка входу: Неправильний пароль.');
            }
        });
    });
}


// ЗАКРИТТЯ ПІДКЛЮЧЕННЯ

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('? З\'єднання з базою даних закрито.');
});