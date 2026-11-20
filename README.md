# Library Management App

Express + MongoDB (Mongoose) backend with a single-page frontend.

## Run
```bash
npm install
npm run seed   # optional sample data
npm start      # http://localhost:3000
```

Configuration lives in `.env` (never commit it; `.gitignore` already excludes it).

## Features
- Books: add, edit, delete, search by title/author/ISBN, copy tracking
- Members: add, edit, delete, search, active/inactive status
- Loans: issue (atomic stock check), return, overdue filter, fines (₹5/day by default), max 5 books per member
- Dashboard: totals, overdue count, most-borrowed titles

## API
| Method | Path | Purpose |
|---|---|---|
| GET/POST | /api/books | list (`?q=`) / create |
| PUT/DELETE | /api/books/:id | update / delete |
| GET/POST | /api/members | list (`?q=`) / create |
| PUT/DELETE | /api/members/:id | update / delete |
| GET/POST | /api/loans | list (`?status=active\|overdue\|returned`) / issue |
| POST | /api/loans/:id/return | return a book |
| GET | /api/stats | dashboard numbers |

Data is stored in the `library` database (collections: books, members, loans).
Remember to allow your IP in MongoDB Atlas → Network Access.
