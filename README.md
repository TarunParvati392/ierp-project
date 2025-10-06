---

# 📚 iERP: Smart System for College Automation

This system helps to handle all the functions held in the college like Grevance Mangement System, Asset Management System, Admission Handling, Assessment and Attendace Handling, Staff Management etc. The purpose of this project is to design and implement a lightweight, self-managed, role-based ERP solution that streamlines academic and administrative activities while reducing dependency on external vendors. 

---

## 🌐 Live Demo

- **Frontend:** [ierp-project.vercel.app](https://ierp-project.vercel.app/)
- **Backend:** [ierp-server.onrender.com](https://ierp-server.onrender.com/)

---

## ✨ Features

- Create the Role Based Dashboards like Student, HOD, Dean, Admin, Academic Manager, Schedule Manager etc.
- Real-time Updates in the Database
- Mail Notifications to the Users after creating the Accounts to reduce the Commnunication gaps.
- Faculty Assignments, Dean Assignments are done Smoothly
- Automatic Time Table Generation

---

## 🛠️ Tech Stack

- **Frontend:** React, TailwindCSS
- **Backend:** Node.js, Express.js, MongoDB Atlas
- **Deployment:** Vercel (frontend), Render (backend)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/TarunParvati392/ierp-project.git
cd ierp-project
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT = 10000
JWT_SECRET = superSecretJWTKey123
EMAIL_USER = Your Mail_ID Here
EMAIL_PASS = Your Mail_App_Password Here
BASE_URL = http://localhost:3000
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm start
```

Create a `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:10000/api
```

### 4. Access the App

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 Usage Notes

- For production, update the API URLs in the `.env` files to point to your deployed backend.
- Ensure MongoDB Atlas is accessible from your backend server.

---

## 👩‍💻 Contributors

- Tarun Parvathi

---

## 🏆 Project Notes

Built as part of the MCA Degree completion in 2 Months.  
Designed to reduce the dependency on external vendors.

---