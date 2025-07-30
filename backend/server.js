// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Allow server to parse JSON in request bodies

const pendingRequests = []; 
const approvedUsers = [];

// --- API Endpoints ---
app.post('/api/request-access', (req, res) => {
  const { username, password } = req.body;
  console.log('Access Request for:', username);
  // TODO: Add database logic here
  res.status(200).json({ message: 'Request received and is pending approval.' });
});
//EMAILJS


// --- Function to Send Email from Backend ---
async function sendApprovalEmailToManager(userDetails, approvalLink, denyLink) {
  // 1. Configure how to send the email (e.g., with Gmail)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'YOUR_GMAIL_ADDRESS@gmail.com', // Your email
      pass: 'YOUR_GMAIL_APP_PASSWORD' // Your Gmail App Password
    }
  });

  // 2. Define the email content
  let mailOptions = {
    from: '"Your App Name" <YOUR_GMAIL_ADDRESS@gmail.com>',
    to: 'manager-email@example.com', // The manager's email address
    subject: `New User Signup Approval: ${userDetails.username}`,
    html: `
      <h3>New Access Request</h3>
      <p>A new user has signed up and is waiting for approval.</p>
      <ul>
        <li><strong>Username:</strong> ${userDetails.username}</li>
        <li><strong>Email:</strong> ${userDetails.email || 'Not provided'}</li>
      </ul>
      <p>
        <a href="${approvalLink}" style="padding: 10px 15px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Approve Request</a>
      </p>
      <p>
        <a href="${denyLink}" style="padding: 10px 15px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Deny Request</a>
      </p>
    `
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
  console.log('Approval email sent to manager.');
}


// --- API Endpoint for Signup ---
app.post('/api/request-access', async (req, res) => {
  const { username, password } = req.body; // password is the encrypted hash

  // Create and save the request
  const approvalToken = crypto.randomBytes(32).toString('hex');
  const newRequest = { username, encrypted_password: password, approval_token: approvalToken };
  pendingRequests.push(newRequest); // TODO: Replace with database logic

  // Create the approval/deny links
  const approvalLink = `http://localhost:3001/api/approve?token=${approvalToken}`;
  const denyLink = `http://localhost:3001/api/deny?token=${approvalToken}`;

  // ✅ Call the function to send the email from the server
  try {
    await sendApprovalEmailToManager({ username }, approvalLink, denyLink);
    res.status(200).json({ message: 'Request submitted! It will be reviewed by a manager.' });
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).json({ message: 'Request submitted, but failed to send notification email.' });
  }
});

// TODO: Add other endpoints like /api/approve and /api/login here
// --- API Endpoints ---

// server.js

// ... (your existing code for express, cors, bcrypt, etc.)

// Endpoint to securely hash a password
app.post('/api/encrypt-password', async (req, res) => {
    try {
      const { password } = req.body;
  
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
  
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // ✅ --- THIS LINE PRINTS THE ENCRYPTED PASSWORD ---
      console.log('Generated Hash:', hashedPassword);
      
      res.status(200).json({ encryptedPassword: hashedPassword });
  
    } catch (error) {
      console.error('Encryption error:', error);
      res.status(500).json({ error: 'Server error during encryption' });
    }
  });
  
  // ... (the rest of your server code)

// NEW: Endpoint to securely hash a password
app.post('/api/encrypt-password', async (req, res) => {
    try {
      const { password } = req.body;
  
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }

      console.log('🔐 Backend: Password encryption requested');
      console.log('📝 Backend: Original password received:', password);
  
      const saltRounds = 10; // Standard number of salt rounds
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      console.log('✅ Backend: Password encrypted successfully!');
      console.log('🔒 Backend: Hashed password:', hashedPassword);
  
      res.status(200).json({ encryptedPassword: hashedPassword });
  
    } catch (error) {
      console.error('Encryption error:', error);
      res.status(500).json({ error: 'Server error during encryption' });
    }
  });

  // Add these endpoints after your /api/request-access endpoint

app.get('/api/approve', (req, res) => {
    const { token } = req.query;
    // TODO: Find the user in 'pendingRequests' with this token.
    // If found, move them to an 'approvedUsers' array and remove them from 'pendingRequests'.
    console.log(`Request approved with token: ${token}`);
    res.send('<h1>Request Approved!</h1><p>The user now has access.</p>');
  });
  
  app.get('/api/deny', (req, res) => {
    const { token } = req.query;
    // TODO: Find the user in 'pendingRequests' with this token and remove them.
    console.log(`Request denied with token: ${token}`);
    res.send('<h1>Request Denied</h1><p>The user has not been granted access.</p>');
  });
  
  
//   // Your existing endpoint for requesting access
//   app.post('/api/request-access', (req, res) => {
//     const { username, password } = req.body; // 'password' is the encrypted hash
  
//     // 1. Basic Validation
//     if (!username || !password) {
//       return res.status(400).json({ error: 'Username and encrypted password are required.' });
//     }
    
//     // 2. Generate a unique and secure approval token
//     const approvalToken = crypto.randomBytes(32).toString('hex');
    
//     const newRequest = {
//       username,
//       encrypted_password: password,
//       approval_token: approvalToken,
//       status: 'pending',
//       request_date: new Date()
//     };
    
//     // 3. Store the request
//     // TODO: Replace this with your actual database logic
//     pendingRequests.push(newRequest);
//     console.log('New request added to pending requests:', newRequest);
    
//     // 4. Send the approval email
//     // TODO: Integrate your actual email service (SendGrid, Mailgun, etc.) here
//     console.log('--- APPROVAL EMAIL SIMULATION ---');
//     console.log(`To: Approver`);
//     console.log(`From: System`);
//     console.log(`Subject: Access Request for ${username}`);
//     console.log(`Approve Link: http://localhost:${PORT}/api/approve?token=${approvalToken}`);
//     console.log(`Deny Link: http://localhost:${PORT}/api/deny?token=${approvalToken}`);
//     console.log('---------------------------------');
    
//     // 5. Send success response to the frontend
//     res.status(200).json({ message: 'Request received and is pending approval.' });
//   });
  
  


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});