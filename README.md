# ERP-MES System

A comprehensive Electronic Batch Records (EBR) System built with Next.js, MongoDB, transforming traditional paper-based manufacturing processes into a streamlined digital platform.

## Project Overview

This system was developed to digitalize manufacturing batch records, improving operational efficiency and ensuring regulatory compliance. The platform features dynamic template configuration, robust user authentication, and comprehensive audit logging.

## Key Achievements

- Successfully transformed paper-based processes to a digital platform, reducing processing time by eliminating manual paperwork
- Implemented flexible data structures supporting diverse batch record templates
- Established role-based access control with secure authentication
- Created comprehensive audit logging system for regulatory compliance

## Features

- User Authentication and Authorization
- Password Management System
- Batch Record Management
- Email Notifications
- Document Template Management
- Secure Password Requirements
- Dynamic Template Management
  - Configurable form fields and sections
  - Support for various data types (text, number, date, checkboxes)
  - Version control for templates
  - Flexible validation rules
- Audit Trail System
  - Comprehensive action logging
  - User activity tracking
  - Change history
  - Digital signatures
  - Timestamp recording
- Role-Based Access Control
  - User role management
  - Permission-based feature access
  - Secure authentication flow
  - Password policy enforcement

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Email Service**: SendGrid
- **Testing**: Jest
- **Security**: bcrypt for password hashing

## Getting Started

1. Clone the repository
2. npm install
3. edit .env file
3. npm run dev
