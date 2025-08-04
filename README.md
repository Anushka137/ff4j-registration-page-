# FF4J Feature Flag Management System

A comprehensive feature flag management system with user registration, approval workflows, and real-time feature flag management.

## 🚀 Features

### **User Management**
- User registration with email verification
- Manager approval workflow for new users
- Secure password encryption with bcrypt
- Email notifications for approval/denial

### **Feature Flag Management**
- Create, edit, delete, and toggle feature flags
- Permission-based access control
- Manager approval required for all changes
- Real-time updates with auto-refresh
- Persistent storage with file-based system

### **Email System**
- Automated email notifications
- Manager approval requests
- User confirmation emails
- Fallback handling for email failures

## 🛠️ Technology Stack

### **Backend**
- **Node.js** with Express.js
- **Nodemailer** for email functionality
- **bcrypt** for password encryption
- **crypto** for secure token generation
- **File-based storage** for persistence

### **Frontend**
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation

## 📁 Project Structure

```
ffj-paytm/
├── backend/
│   ├── server.js              # Main backend server
│   ├── package.json           # Backend dependencies
│   ├── token-storage.json     # User approval tokens
│   ├── feature-changes.json   # Feature change requests
│   └── feature-flags.json     # Feature flag data
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx      # User registration/login
│   │   │   └── FeatureFlagPage.tsx # Feature flag dashboard
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # React entry point
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite configuration
└── README.md                  # Project documentation
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Gmail account with App Password

### **1. Clone the Repository**
```bash
git clone https://github.com/Anushka137/ff4j-registration-page-.git
cd ff4j-registration-page-
```

### **2. Backend Setup**
```bash
cd backend
npm install
```

### **3. Configure Email Settings**
Update the email configuration in `backend/server.js`:
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
```

### **4. Start Backend Server**
```bash
node server.js
```
Backend will run on `http://localhost:3001`

### **5. Frontend Setup**
```bash
cd frontend
npm install
```

### **6. Start Frontend Development Server**
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

## 📱 Usage

### **User Registration**
1. Visit `http://localhost:5173/`
2. Fill in registration form
3. Manager receives approval email
4. Manager clicks approve/deny link
5. User receives confirmation email

### **Feature Flag Management**
1. Visit `http://localhost:5173/feature-flags`
2. View current feature flags
3. Request changes (toggle, add, edit, delete)
4. Manager receives approval email
5. Manager approves/denies changes
6. Changes are applied automatically

## 🔧 API Endpoints

### **User Management**
- `POST /api/encrypt-password` - Encrypt user password
- `POST /api/request-access` - Request user account approval
- `GET /api/approve` - Approve user account
- `GET /api/deny` - Deny user account

### **Feature Flag Management**
- `GET /api/feature-flags` - Get all feature flags
- `POST /api/request-feature-change` - Request feature change
- `GET /api/approve-feature-change` - Approve feature change
- `GET /api/deny-feature-change` - Deny feature change

### **Admin Endpoints**
- `GET /api/pending-requests` - View pending user requests
- `GET /api/pending-feature-changes` - View pending feature changes
- `GET /api/approved-users` - View approved users
- `POST /api/clean-expired-tokens` - Clean expired tokens

## 🔐 Security Features

- **Password Encryption**: bcrypt with salt rounds
- **Secure Tokens**: Crypto-generated approval tokens
- **Token Expiry**: 24-hour token expiration
- **Input Validation**: Server-side validation
- **CORS Protection**: Configured for local development

## 📧 Email Configuration

The system uses Gmail SMTP for sending emails. You need to:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password
3. Update the email configuration in `backend/server.js`

## 🚀 Deployment

### **Environment Variables**
Create a `.env` file in the backend directory:
```env
PORT=3001
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

### **Production Considerations**
- Use environment variables for sensitive data
- Set up proper CORS configuration
- Use a production database instead of file storage
- Configure proper email service
- Set up SSL/TLS certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Author

**Anushka Shrivastava**
- GitHub: [@Anushka137](https://github.com/Anushka137)

## 🙏 Acknowledgments

- React team for the amazing framework
- Node.js community for the robust runtime
- Tailwind CSS for the utility-first styling
- All contributors and supporters