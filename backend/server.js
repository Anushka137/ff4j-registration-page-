// my-backend/server.js

// --- 1. DEPENDENCIES ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// --- 2. APP SETUP ---
const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// --- 3. DATABASE (Temporary In-Memory Storage) ---
const pendingRequests = [];
const approvedUsers = [];

// --- 4. NODEMAILER TRANSPORTER CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 't-ishi.gupta@ocltp.com', // Your full Gmail address
    pass: 'uspp zxkb vfou gnxh'     // The 16-character App Password
  },
  tls: {
    rejectUnauthorized: false
  }
});


// --- 5. API ENDPOINTS ---

/**
 * Endpoint to ONLY encrypt a password.
 * This is the first step called by the frontend.
 */
app.post('/api/encrypt-password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    res.status(200).json({ encryptedPassword: hashedPassword });
  } catch (error) {
    console.error('Encryption error:', error);
    res.status(500).json({ error: 'Server error during encryption' });
  }
});

/**
 * Endpoint to handle the access request AFTER the password has been encrypted.
 * This is the second step called by the frontend.
 */
app.post('/api/request-access', async (req, res) => {
  try {
    const { username, email, password } = req.body; // 'password' is now the encrypted hash

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and encrypted password are required.' });
    }

    const approvalToken = crypto.randomBytes(32).toString('hex');
    const newRequest = { username, email, encrypted_password: password, approval_token: approvalToken };
    pendingRequests.push(newRequest);
    console.log('New access request saved:', newRequest);

    const approvalLink = `http://localhost:3001/api/approve?token=${approvalToken}`;
    const denyLink = `http://localhost:3001/api/deny?token=${approvalToken}`;

    const mailOptions = {
      from: '"Your App Name" <t-ishi.gupta@ocltp.com>', // The 'from' address must be your authenticated email
      to: 't-ishi.gupta@ocltp.com', // The fixed manager's email
      replyTo: email,
      subject: `New Access Request: ${username}`,
      html: `
        <h3>New User Signup</h3>
        <p>A user, <strong>${username} (${email})</strong>, has requested access.</p>
        <p>Please review and choose an action:</p>
        <p style="margin: 20px 0;">
          <a href="${approvalLink}" style="padding: 12px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-right: 10px;">Approve</a>
          <a href="${denyLink}" style="padding: 12px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Deny</a>
        </p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent for user: ${username}`);
    res.status(200).json({ message: 'Request submitted! It will be reviewed by a manager.' });

  } catch (error) {
    console.error('--- ERROR in /api/request-access ---', error);
    res.status(500).json({ message: 'Server failed to process the request.' });
  }
});

/**
 * Endpoint to handle the approval link.
 */
app.get('/api/approve', async (req, res) => {
  try {
      const { token } = req.query;
      const requestIndex = pendingRequests.findIndex(req => req.approval_token === token);

      if (requestIndex !== -1) {
          const [approvedRequest] = pendingRequests.splice(requestIndex, 1);
          approvedUsers.push(approvedRequest);
          console.log('User approved:', approvedRequest.username);

          const userMailOptions = {
              from: `"Your App Name" <t-ishi.gupta@ocltp.com>`,
              to: approvedRequest.email,
              subject: 'Your Account has been Approved!',
              html: `
                  <h3>Welcome, ${approvedRequest.username}!</h3>
                  <p>Your request for access has been approved. You can now log in.</p>
              `
          };
          await transporter.sendMail(userMailOptions);
          console.log(`Approval confirmation sent to ${approvedRequest.email}`);

          res.send('<h1>User Approved!</h1><p>A confirmation email has been sent to the user.</p>');
      } else {
          res.status(404).send('<h1>Invalid or expired token.</h1>');
      }
  } catch (error) {
      console.error('--- ERROR in /api/approve ---', error);
      res.status(500).send('<h1>An error occurred while processing the approval.</h1>');
  }
});

/**
 * Endpoint to handle the denial link.
 */
app.get('/api/deny', async (req, res) => {
  try {
      const { token } = req.query;
      const requestIndex = pendingRequests.findIndex(req => req.approval_token === token);

      if (requestIndex !== -1) {
          const [deniedRequest] = pendingRequests.splice(requestIndex, 1);
          console.log('User denied:', deniedRequest.username);

          const userMailOptions = {
              from: `"Your App Name" <t-ishi.gupta@ocltp.com>`,
              to: deniedRequest.email,
              subject: 'Update on your access request',
              html: `
                  <h3>Hello ${deniedRequest.username},</h3>
                  <p>After a review, we are unable to approve your access request at this time.</p>
              `
          };
          await transporter.sendMail(userMailOptions);
          console.log(`Denial notification sent to ${deniedRequest.email}`);

          res.send('<h1>Request Denied</h1><p>A notification email has been sent to the user.</p>');
      } else {
          res.status(404).send('<h1>Invalid or expired token.</h1>');
      }
  } catch (error) {
      console.error('--- ERROR in /api/deny ---', error);
      res.status(500).send('<h1>An error occurred while processing the denial.</h1>');
  }
});

// --- 6. START THE SERVER ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
