const sqlite3 = require('sqlite3').verbose();

// connects to or creates 'classicReads.sqlite'
// if the file doesn't exist, it will be created
const db = new sqlite3.Database('classicReads.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1); // exits with an error code if DB cannot be opened
    } else {
        console.log('Connected to the classicReads.sqlite database.');

        // creates ContactDetails table
        db.run(`
            CREATE TABLE IF NOT EXISTS ContactDetails (
                contact_id INTEGER PRIMARY KEY AUTOINCREMENT,
                fname TEXT NOT NULL,
                sname TEXT NOT NULL,
                email TEXT NOT NULL,
                mobile TEXT,
                newsletter_opt_in INTEGER DEFAULT 0 -- 0 for false, 1 for true
            )
        `, (tableErr) => {
            if (tableErr) {
                console.error('Error creating ContactDetails table:', tableErr.message);
            } else {
                console.log('ContactDetails table ensured to exist.');

                // creates BookRequests table (put after ContactDetails, as it has a foreign key)
                db.run(`
                    CREATE TABLE IF NOT EXISTS BookRequests (
                        request_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        author TEXT NOT NULL,
                        comments TEXT,
                        request_date TEXT NOT NULL,
                        contact_id INTEGER NOT NULL,
                        FOREIGN KEY (contact_id) REFERENCES ContactDetails(contact_id)
                    )
                `, (bookTableErr) => {
                    if (bookTableErr) {
                        console.error('Error creating BookRequests table:', bookTableErr.message);
                    } else {
                        console.log('BookRequests table ensured to exist.');
                    }
                    // closes the database connection after all tables are created
                    db.close((closeErr) => {
                        if (closeErr) {
                            console.error('Error closing database:', closeErr.message);
                        } else {
                            console.log('Database connection closed for createDB.js.');
                        }
                    });
                });
            }
        });
    }
});