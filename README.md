# 📢 Job Posting & Application Platform 📢

## Description

A modern job marketplace application featuring role-based access for companies and applicants, resume uploads, and email notifications. Built with Node.js/Express backend and Angular frontend.

## Features

- **Company Dashboard**: Post, update, and manage job listings
- **Applicant Portal**: Browse jobs, upload resumes (PDF), and track application status
- **User Roles**: Role-based authentication and authorization (company vs. applicant)
- **Email Notifications**: Automated emails for application submission, acceptance, and rejection via Nodemailer
- **Secure File Handling**: Resume upload management with Multer
- **RESTful API** for seamless integration

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** Angular
- **Email Service:** Nodemailer
- **File Uploads:** Multer
- **Authentication:** JWT

## Environment Variables

Copy `.env.example` to `.env` and configure:

```dotenv
PORT=4000
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
EMAIL_HOST=<smtp_host>
EMAIL_PORT=<smtp_port>
EMAIL_USER=<smtp_username>
EMAIL_PASS=<smtp_password>
```

## Installation & Development

1. Clone the repo:

   ```bash
   git clone https://github.com/Ahmed1mran/Job-App.git
   cd job-app
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

## Running Locally

1. Start the backend server:

   ```bash
   cd backend
   npm run dev
   ```

2. Start the Angular client:

   ```bash
   cd ../frontend
   ng serve
   ```

3. Navigate to `http://localhost:4200` in your browser.

## API Documentation

Endpoint documentation available at `http://localhost:4000/api/docs` (Swagger).

## Contributing

Feel free to contribute by opening issues and pull requests. Please follow the project's code style and commit message conventions.

## License

MIT License © \[Ahmed Imran]
