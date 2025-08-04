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
- Real-time updates with auto-refresh (30-second intervals)
- Persistent storage with separate file-based systems
- Separate token storage for feature changes vs user approvals
- Automatic token expiry and cleanup

### **Email System**
- Automated email notifications
- Manager approval requests
- User confirmation emails
- Fallback handling for email failures
- Fresh SMTP connections for each email
- Enhanced error handling and logging

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
│   ├── server.js              # Main backend server with all endpoints
│   ├── package.json           # Backend dependencies
│   ├── token-storage.json     # User approval tokens (auto-generated)
│   ├── feature-changes.json   # Feature change requests (auto-generated)
│   ├── feature-flags.json     # Feature flag data (auto-generated)
│   └── .env                   # Environment variables (create this)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx      # User registration/login
│   │   │   └── FeatureFlagPage.tsx # Feature flag dashboard with auto-refresh
│   │   ├── App.tsx            # Main app component with routing
│   │   └── main.tsx           # React entry point
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Vite configuration with API proxy
│   └── tailwind.config.js     # Tailwind CSS configuration
├── .gitignore                 # Git ignore rules
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
The system now uses a fresh transporter for each email to prevent connection issues. Update the email configuration in `backend/server.js`:

```javascript
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    },
    port: 587,
    secure: false,
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: false,
    maxConnections: 1,
    maxMessages: 1
  });
}
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
2. View current feature flags with real-time updates
3. Request changes (toggle, add, edit, delete)
4. Manager receives approval email with detailed information
5. Manager approves/denies changes via email links
6. Changes are applied automatically and reflected in real-time
7. Users receive confirmation emails for approved/denied changes

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
- **Token Expiry**: 24-hour token expiration with automatic cleanup
- **Input Validation**: Server-side validation
- **CORS Protection**: Configured for local development
- **Separate Storage**: Feature changes and user approvals use separate storage systems
- **Fresh Connections**: Each email uses a new SMTP connection to prevent timeouts

## 📧 Email Configuration

The system uses Gmail SMTP for sending emails with enhanced reliability. You need to:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password
3. Update the email configuration in `backend/server.js`

### **Email Features:**
- **Fresh Connections**: Each email uses a new SMTP connection
- **Fallback Handling**: System continues working even if emails fail
- **Detailed Notifications**: Rich HTML emails with approval/denial links
- **Error Logging**: Comprehensive logging for troubleshooting

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
- Implement proper logging and monitoring
- Set up automated backups for data files

## 🔧 Troubleshooting

### **Common Issues:**

#### **Email Not Sending:**
- Check Gmail App Password is correct
- Ensure 2-Factor Authentication is enabled
- Check network connectivity
- Review server logs for detailed error messages

#### **Feature Changes Not Working:**
- Ensure backend server is running on port 3001
- Check browser console for JavaScript errors
- Verify API endpoints are accessible
- Check pending feature changes: `GET /api/pending-feature-changes`

#### **Tokens Expiring:**
- Tokens automatically expire after 24 hours
- Use `POST /api/clean-expired-tokens` to clean expired tokens
- Check token storage files for debugging

#### **Frontend Not Updating:**
- Frontend auto-refreshes every 30 seconds
- Use the manual refresh button if needed
- Check network connectivity to backend

### **Debug Endpoints:**
- `GET /api/pending-requests` - View pending user requests
- `GET /api/pending-feature-changes` - View pending feature changes
- `GET /api/approved-users` - View approved users
- `GET /api/feature-flags` - View current feature flags

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