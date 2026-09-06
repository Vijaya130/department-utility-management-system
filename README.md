# Department Utility Management System

## 📌 Project Overview

The **Department Utility Management System (DUMS)** is a web-based application developed to manage and visualize department-level academic and administrative information.

The system provides separate interfaces for different roles such as **Admin, HOD, and Mentor**, with role-based access to department information.

The application is designed for the **ISE Department** to simplify student, faculty, mentor-mentee, notices, certificates, placements, extracurricular activities, and analytics management.

---

## 🎯 Objectives

- Centralize department information in one system
- Manage student and faculty records
- Manage mentor-mentee information
- Provide separate Admin and HOD dashboards
- Implement role-based access
- Allow HOD to view student academic records
- Manage student certificates and achievements
- Provide graphical analytics of student information
- Simplify access to department notices and records

---

## 🛠️ Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML
- CSS

### Backend / Database
- Supabase
- PostgreSQL

### Data Visualization
- Recharts

### Development Tools
- Visual Studio Code
- Git
- GitHub
- npm

---

## 👥 Team Members

- **Vijaya G Nayak**
- **Shaarwari**
- **Varsha**
- **Shravya K**
- **Ananya**
- **Shravani**
- **Devika**

---

## 🔐 User Roles

### 👑 Admin

The Admin has management-level access to department information.

Admin features include:

- Student management
- Faculty management
- Mentor-mentee management
- Notices management
- Analytics
- Department records management

---

### 👩‍💼 HOD

The HOD has department-level viewing and monitoring access.

HOD features currently include:

- HOD Dashboard
- Student Records
- Student academic information
- Certificates
- Analytics

The HOD interface is designed separately from the Admin management interface.

---

### 🧑‍🏫 Mentor

The Mentor interface provides access to mentor-mentee information and assigned students.

---

## 📊 Analytics Dashboard

The Analytics Dashboard provides graphical visualization of student-related information.

Available categories include:

- Attendance
- Academics
- Certificates
- Placements

Supported chart types include:

- Line Chart
- Bar Chart
- Pie Chart

The analytics dashboard uses **Recharts** for visualization.

---

## 🎓 Student Management

The Student module supports:

- Adding student records
- Searching students
- Editing student information
- Deleting student records
- Viewing academic information

Student information includes details such as:

- Name
- USN
- Year
- Branch
- Contact information
- Semester marks
- 10th marks
- 12th/Diploma marks
- Backlogs
- Achievements

---

## 👨‍🏫 Faculty Management

The Faculty module provides functionality for managing department faculty information.

---

## 🧑‍🤝‍🧑 Mentor-Mentee Management

The system maintains mentor-mentee assignments and allows mentor-wise student information to be viewed.

Mentees can be organized based on their academic year.

---

## 📢 Notices

The Notices module provides department notice management and display functionality.

---

## 📜 Certificates

A dedicated Certificates module has been introduced for maintaining student certificate information.

Certificate records contain:

- USN
- Student Name
- Certificate Name
- Category
- Issuing Organization
- Issue Date
- Description

The HOD interface provides a view/search facility for certificate records.

---

## 🗄️ Database

The application uses **Supabase PostgreSQL** as its backend database.

Current database tables include:

- `students`
- `faculty`
- `notices`
- `mentorMentee`
- `certificates`

Additional tables and modules will be added as development continues.

---

## 🚀 Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/Vijaya130/department-utility-management-system.git