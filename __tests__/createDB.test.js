const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = path.join(__dirname, 'classicReads.sqlite');

beforeAll(() => {
  // checking table exists
  require('../createDB.js');
});

test('Database file should exist', () => {
  const fs = require('fs');
  expect(fs.existsSync(DB_FILE)).toBe(true);
});

test('ContactDetails table should exist with expected columns', (done) => {
  const db = new sqlite3.Database(DB_FILE);
  db.all(`PRAGMA table_info(ContactDetails);`, (err, rows) => {
    expect(err).toBeNull();
    const columnNames = rows.map(r => r.name);
    expect(columnNames).toEqual(
      expect.arrayContaining(['contact_id', 'fname', 'sname', 'email', 'mobile', 'newsletter_opt_in'])
    );
    db.close();
    done();
  });
});

test('BookRequests table should exist with expected columns', (done) => {
  const db = new sqlite3.Database(DB_FILE);
  db.all(`PRAGMA table_info(BookRequests);`, (err, rows) => {
    expect(err).toBeNull();
    const columnNames = rows.map(r => r.name);
    expect(columnNames).toEqual(
      expect.arrayContaining(['request_id', 'title', 'author', 'comments', 'request_date', 'contact_id'])
    );
    db.close();
    done();
  });
});
