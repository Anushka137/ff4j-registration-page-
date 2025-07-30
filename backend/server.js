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



// --- API Endpoint for Signup ---
app.post('/api/request-access', async (req, res) => {
  try {
    const { username, email, password } = req.body; // password is the hash

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    // A. Create and save the pending request
    const approvalToken = crypto.randomBytes(32).toString('hex');
    const newRequest = { username, email, encrypted_password: password, approval_token: approvalToken };
    pendingRequests.push(newRequest);
    console.log('New access request saved:', newRequest);

    // B. Prepare email content
    // const approvalLink = `http://localhost:3001/api/approve?token=${approvalToken}`;
    // const denyLink = `http://localhost:3001/api/deny?token=${approvalToken}`;

    const mailOptions = {
      from: `"Your App Name" <ishigupta1201@gmail.com>`,
      to: email, // The manager's email address
      // replyTo: email,
      subject: `New Access Request: ${username}`,
      html: `
        <div style="font-family: system-ui, sans-serif, Arial; font-size: 12px;">
  <div>A message by {{name}} has been received. Kindly respond at your earliest convenience.</div>

  <div style="margin-top: 20px; padding: 15px 0; border-width: 1px 0; border-style: dashed; border-color: lightgrey;">
    <table role="presentation">
      <tbody>
        <tr>
          <td style="vertical-align: top;">
            <div style="padding: 6px 10px; margin: 0 10px; background-color: aliceblue; border-radius: 5px; font-size: 26px;" role="img">👤</div>
          </td>
        </tr>
      </tbody>
    </table>

    <br><span class="mtk1">Hello {{name}},</span><br><br>
    <span class="mtk1">Please click the button below to verify your email:</span><br><br>

    <!-- Button Starts Here -->
    <a href="http://localhost:5173/feature-flags" target="_blank" style="display: inline-block; background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Click Here</a>
    <br><br>
    <!-- Button Ends Here -->

    
    <span class="mtk1">If you didn't create an account, please ignore this email.</span><br><br>
    <span class="mtk1">Best regards,</span><br>
    <span class="mtk1">Your App Team</span>
  </div>
</div>`
      
    };

    // C. Send the email using the configured transporter
    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent for user: ${username}`);
    res.status(200).json({ message: 'Request submitted! It will be reviewed by a manager.' });

  } catch (error) {
    console.error('--- ERROR in /api/request-access ---', error);
    res.status(500).json({ message: 'Server failed to process the request.' });
  }
});
// TODO: Add other endpoints like /api/approve and /api/login here
// --- API Endpoints ---
  

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
  
// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});