# Mini CRM Frontend

React + Vite frontend for the Mini CRM Opportunity Tracker.

## Features

* User Registration & Login
* JWT Authentication
* Shared Opportunity Dashboard
* Search Opportunities
* Filter by Stage and Priority
* Create Opportunities
* Edit/Delete Own Opportunities
* Dashboard Summary Cards
* Responsive UI with Tailwind CSS

---

## Tech Stack

* React 18
* Vite
* React Router DOM
* Axios
* Tailwind CSS

---

## Folder Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar
│   │   ├── OpportunityCard
│   │   ├── OpportunityForm
│   │   ├── Modal
│   │   └── ProtectedRoute
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Login
│   │   ├── Register
│   │   └── Dashboard
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── .env.example
```

---

## Installation

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

Application URL:

```text
http://localhost:5173
```

---

## Available Pages

### Login

Authenticate existing users.

### Register

Create a new account.

### Dashboard

* View opportunities
* Search opportunities
* Filter by stage
* Filter by priority
* View pipeline metrics
* Create new opportunities

---

## Authentication

JWT-based authentication is used.

Protected routes:

* Dashboard
* Create Opportunity
* Edit Opportunity
* Delete Opportunity

---

## API Configuration

For production:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## Deployment (Vercel)

1. Push code to GitHub.
2. Import repository into Vercel.
3. Select Framework Preset: **Vite**.
4. Add environment variable:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

5. Deploy.

---

## Future Enhancements

* Pagination UI
* Kanban Board View
* Dark Mode
* Real-Time Updates
* Export Opportunities

```
```
