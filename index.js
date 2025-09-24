// Require the express web application framework (https://expressjs.com)
const express = require('express')
const morgan = require('morgan');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose(); // imports sqlite3

// Create a new web application by calling the express function
const app = express()
const port = 3000


// --- Database Connection and Initialisation ---
// Connects to or creates 'classicReads.sqlite'
const db = new sqlite3.Database('classicReads.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1); // exits with an error code if DB cannot be opened
  } else {
    console.log('Connected to the classicReads.sqlite database.');

    // ensures ContactDetails table exists
    db.run(`
          CREATE TABLE IF NOT EXISTS ContactDetails (
              contact_id INTEGER PRIMARY KEY AUTOINCREMENT,
              fname TEXT NOT NULL,
              sname TEXT NOT NULL,
              email TEXT UNIQUE NOT NULL,
              mobile TEXT,
              newsletter_opt_in INTEGER DEFAULT 0
          )
      `, (tableErr) => {
      if (tableErr) {
        console.error('Error creating ContactDetails table:', tableErr.message);
      } else {
        console.log('ContactDetails table ensured to exist.');

        // ensures BookRequests table exists (with Foreign Key)
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
        });
      }
    });
  }
});


// --- Middleware ---
app.use(morgan('common')); // for logging HTTP requests
app.use(bodyParser.urlencoded({ extended: true })); // parses URL-encoded bodies
app.set('view engine', 'ejs'); // sets EJS as the view engine
app.set('views', './views'); // specifies the directory for EJS templates

// tells our application to serve all the files under the `public_html` directory
app.use(express.static('public_html'))


// --- Routes ---

app.get('/', (req, res) => {
  res.redirect('/home.html'); // redirects to the home page
});


// POST /submit-request ,handling book request form submission
app.get('/', (req, res) => {
  res.redirect('/request.html'); // Redirect to the book request form
});

// POST /submit-request , handles book request form submission
app.post('/submit-request', (req, res) => {
  // Extract data from the request body
  const { bookTitle, author, commentField, firstname, surname, email, mobile, newsletter } = req.body;

  console.log("Received Book Request:");
  console.log(`Book: ${bookTitle} by ${author}`);
  console.log(`Comments: ${commentField}`);
  console.log(`Contact: ${firstname} ${surname}, Email: ${email}, Mobile: ${mobile}, Newsletter: ${newsletter}`);

  const requestDate = new Date().toISOString(); // sets current date in ISO format
  const newsletterOptIn = newsletter === 'on' ? 1 : 0; // Convert checkbox value to 0 or 1

  // checks if contact already exists
  db.get(`SELECT contact_id FROM ContactDetails WHERE email = ?`, [email], (err, row) => {
    if (err) {
      console.error('Error checking contact existence:', err.message);
      return res.status(500).send('Error processing request.');
    }

    let contactId;

    // inserts the book request
    const insertBookRequest = (cId) => {
      const insertBookSql = `
              INSERT INTO BookRequests (title, author, comments, request_date, contact_id)
              VALUES (?, ?, ?, ?, ?)
          `;
      db.run(insertBookSql, [
        bookTitle,
        author,
        commentField,
        requestDate,
        cId // uses the contact_id obtained
      ], function (bookInsertErr) {
        if (bookInsertErr) {
          console.error('Error inserting book request:', bookInsertErr.message);
          return res.status(500).send('Error saving book request.');
        }
        console.log(`Book request inserted with request_id = ${this.lastID}`);

        // renders success page, passing all details for display
        res.render('request_success', {
          title: 'Request Submitted',
          bookTitle, author, comments: commentField, requestDate,
          firstname, surname, email, mobile, newsletterOptIn
        });
      });
    };

    if (row) {
      // contact exists, uses existing contact_id
      contactId = row.contact_id;
      console.log(`Existing contact found: contact_id = ${contactId}`);
      // updates contact details if they have changed
      db.run(`UPDATE ContactDetails SET fname = ?, sname = ?, mobile = ?, newsletter_opt_in = ? WHERE contact_id = ?`,
        [firstname, surname, mobile, newsletterOptIn, contactId], (updateErr) => {
          if (updateErr) console.error('Error updating contact details:', updateErr.message);
          // Now insert the book request AFTER the update is complete
          insertBookRequest(contactId);
        });
    } else {
      // contact does not exist, inserts new contact details
      db.run(`
              INSERT INTO ContactDetails (fname, sname, email, mobile, newsletter_opt_in)
              VALUES (?, ?, ?, ?, ?)
          `, [firstname, surname, email, mobile, newsletterOptIn], function (insertErr) {
        if (insertErr) {
          console.error('Error inserting new contact:', insertErr.message);
          // this fallback handles a condition where another request might have inserted the same email just after db.get check
          if (insertErr.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
            console.warn('Attempted to insert duplicate email, retrying to fetch existing contact.');
            db.get(`SELECT contact_id FROM ContactDetails WHERE email = ?`, [email], (retryErr, retryRow) => {
              if (retryErr || !retryRow) {
                console.error('Failed to get contact after unique constraint violation:', retryErr ? retryErr.message : 'No row found.');
                return res.status(500).send('Error saving contact details (unique email issue).');
              }
              insertBookRequest(retryRow.contact_id);
            });
          } else {
            return res.status(500).send('Error saving contact details.');
          }
        } else {
          contactId = this.lastID; // gets the ID of the newly inserted contact
          console.log(`New contact inserted: contact_id = ${contactId}`);
          // now inserts the book request AFTER the new contact is inserted
          insertBookRequest(contactId);
        }
      });
    }
  });
});


// GET /view-requests , Displays all book requests with contact details
app.get('/view-requests', (req, res) => {
  // uses JOIN query to retrieve data from both tables
  const sql = `
    SELECT
        br.request_id, br.title, br.author, br.comments, br.request_date,
        cd.fname, cd.sname, cd.email, cd.mobile, cd.newsletter_opt_in
    FROM
        BookRequests br
    JOIN
        ContactDetails cd ON br.contact_id = cd.contact_id
    ORDER BY
        br.request_date DESC;
`;

  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Error retrieving all requests:', err.message);
      return res.status(500).send('Error retrieving book requests.');
    }
    // renders the all_requests.ejs template, passing the joined data
    res.render('all_requests', { title: 'All Book Requests', requests: rows });
  });
});



// Tell our application to listen to requests at port 3000 on the localhost
app.listen(port, () => {
  // When the application starts, print to the console that our app is
  // running at http://localhost:3000. Print another message indicating
  // how to shut the server down.
  console.log(`Web server running at: http://localhost:${port}`)
  console.log(`Type Ctrl+C to shut down the web server`)
})

// closes the database connection on process termination
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});