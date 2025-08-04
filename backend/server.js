// my-backend/server.js

// --- 1. DEPENDENCIES ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// --- 2. APP SETUP ---
const app = express();

// --- 1. CORS CONFIGURATION ---
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));

app.use(express.json()); // Middleware to parse JSON bodies

// --- 2. FILE-BASED TOKEN STORAGE ---
const STORAGE_FILE = path.join(__dirname, 'token-storage.json');
const FEATURE_CHANGES_FILE = path.join(__dirname, 'feature-changes.json');
const FEATURE_FLAGS_FILE = path.join(__dirname, 'feature-flags.json');
const TOKEN_EXPIRY_HOURS = 24; // Tokens expire after 24 hours

// Initialize storage file if it doesn't exist
function initializeStorage() {
  if (!fs.existsSync(STORAGE_FILE)) {
    const initialData = {
      pendingRequests: [],
      approvedUsers: [],
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Load data from storage file
function loadStorage() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
      return {
        pendingRequests: data.pendingRequests || [],
        approvedUsers: data.approvedUsers || []
      };
    }
  } catch (error) {
    console.error('Error loading storage:', error);
  }
  return { pendingRequests: [], approvedUsers: [] };
}

// Save data to storage file
function saveStorage(pendingRequests, approvedUsers) {
  try {
    const data = {
      pendingRequests,
      approvedUsers,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving storage:', error);
  }
}

// Clean expired tokens
function cleanExpiredTokens(pendingRequests) {
  const now = new Date();
  return pendingRequests.filter(request => {
    if (!request.createdAt) {
      // If no creation time, assume it's old and remove it
      return false;
    }
    const createdAt = new Date(request.createdAt);
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
    return hoursDiff < TOKEN_EXPIRY_HOURS;
  });
}

// Feature Flag Storage Functions
function initializeFeatureFlags() {
  if (!fs.existsSync(FEATURE_FLAGS_FILE)) {
    const initialFlags = [
      { id: '1', name: 'New User Dashboard', description: 'Enables the redesigned user dashboard.', isEnabled: true },
      { id: '2', name: 'Dark Mode', description: 'Allows users to switch to a dark theme.', isEnabled: false },
      { id: '3', name: 'Beta Feature X', description: 'A new experimental feature for testing.', isEnabled: true },
    ];
    fs.writeFileSync(FEATURE_FLAGS_FILE, JSON.stringify(initialFlags, null, 2));
  }
}

function loadFeatureFlags() {
  try {
    if (fs.existsSync(FEATURE_FLAGS_FILE)) {
      return JSON.parse(fs.readFileSync(FEATURE_FLAGS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading feature flags:', error);
  }
  return [];
}

function saveFeatureFlags(flags) {
  try {
    fs.writeFileSync(FEATURE_FLAGS_FILE, JSON.stringify(flags, null, 2));
  } catch (error) {
    console.error('Error saving feature flags:', error);
  }
}

// Feature Change Storage Functions
function initializeFeatureChanges() {
  if (!fs.existsSync(FEATURE_CHANGES_FILE)) {
    const initialData = {
      pendingChanges: [],
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(FEATURE_CHANGES_FILE, JSON.stringify(initialData, null, 2));
  }
}

function loadFeatureChanges() {
  try {
    if (fs.existsSync(FEATURE_CHANGES_FILE)) {
      const data = JSON.parse(fs.readFileSync(FEATURE_CHANGES_FILE, 'utf8'));
      return {
        pendingChanges: data.pendingChanges || []
      };
    }
  } catch (error) {
    console.error('Error loading feature changes:', error);
  }
  return { pendingChanges: [] };
}

function saveFeatureChanges(pendingChanges) {
  try {
    const data = {
      pendingChanges,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(FEATURE_CHANGES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving feature changes:', error);
  }
}

function cleanExpiredFeatureChanges(pendingChanges) {
  const now = new Date();
  return pendingChanges.filter(change => {
    if (!change.createdAt) {
      return false;
    }
    const createdAt = new Date(change.createdAt);
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
    return hoursDiff < TOKEN_EXPIRY_HOURS;
  });
}

// Initialize storage on startup
initializeStorage();
initializeFeatureFlags();
initializeFeatureChanges();
let { pendingRequests, approvedUsers } = loadStorage();
let { pendingChanges } = loadFeatureChanges();

// Clean expired tokens on startup
pendingRequests = cleanExpiredTokens(pendingRequests);
pendingChanges = cleanExpiredFeatureChanges(pendingChanges);
saveStorage(pendingRequests, approvedUsers);
saveFeatureChanges(pendingChanges);

// --- 3. NODEMAILER TRANSPORTER CONFIGURATION ---
// Create a function to get a fresh transporter for each email
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 't-anushka.shrivastava@ocltp.com', // Your full Gmail address
      pass: 'mepe rlnd hjwv igtc'     // The 16-character App Password
    },
    tls: {
      rejectUnauthorized: false
    },
    port: 587,
    secure: false,
    connectionTimeout: 60000,  // Reduced to 1 minute
    greetingTimeout: 30000,    // Reduced to 30 seconds
    socketTimeout: 60000,      // Reduced to 1 minute
    pool: false,               // Don't reuse connections
    maxConnections: 1,         // Only one connection at a time
    maxMessages: 1             // Only one message per connection
  });
}


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
    const newRequest = { username, email, encrypted_password: password, approval_token: approvalToken, createdAt: new Date().toISOString() };
    pendingRequests.push(newRequest);
    saveStorage(pendingRequests, approvedUsers); // Save to file immediately
    console.log('New access request saved:', newRequest);
    console.log('Current pending requests count:', pendingRequests.length);
    console.log('Current approved users count:', approvedUsers.length);

    const approvalLink = `http://localhost:3001/api/approve?token=${approvalToken}`;
    const denyLink = `http://localhost:3001/api/deny?token=${approvalToken}`;

    const mailOptions = {
      from: '"Your App Name" <c>', // The 'from' address must be your authenticated email
      to: 't-anushka.shrivastava@ocltp.com', // The fixed manager's email
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

    try {
      const freshTransporter = createTransporter();
      await freshTransporter.sendMail(mailOptions);
      console.log(`Approval email sent for user: ${username}`);
      res.status(200).json({ message: 'Request submitted! It will be reviewed by a manager.' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Still save the request even if email fails
      console.log(`Request saved but email failed for user: ${username}`);
      res.status(200).json({ 
        message: 'Request submitted! It will be reviewed by a manager. (Note: Email notification failed, but request is saved.)' 
      });
    }

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
      console.log('Approval attempt for token:', token.substring(0, 8) + '...');
      
      // Reload from file to get latest data
      const { pendingRequests: currentPending, approvedUsers: currentApproved } = loadStorage();
      pendingRequests = currentPending;
      approvedUsers = currentApproved;
      
      console.log('Current pending requests:', pendingRequests.length);
      const requestIndex = pendingRequests.findIndex(req => req.approval_token === token);

      if (requestIndex !== -1) {
          const [approvedRequest] = pendingRequests.splice(requestIndex, 1);
          approvedUsers.push(approvedRequest);
          saveStorage(pendingRequests, approvedUsers); // Save changes to file
          console.log('User approved:', approvedRequest.username);

          const userMailOptions = {
              from: `"Your App Name" <t-anushka.shrivastava@ocltp.com>`,
              to: approvedRequest.email,
              subject: 'Your Account has been Approved!',
              html: `
                  <h3>Welcome, ${approvedRequest.username}!</h3>
                  <p>Your request for access has been approved. You can now log in.</p>
                  <p style="margin: 20px 0;">
                    <strong>Access your Feature Flag Dashboard:</strong><br>
                    <a href="http://localhost:5173/feature-flags" style="padding: 12px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Go to Dashboard</a>
                  </p>
                  <p style="color: #666; font-size: 14px; margin-top: 20px;">
                    If the button doesn't work, copy and paste this URL into your browser:<br>
                    <a href="http://localhost:5173/feature-flags" style="color: #007bff;">http://localhost:5173/feature-flags</a>
                  </p>
              `
          };
          try {
            const freshTransporter = createTransporter();
            await freshTransporter.sendMail(userMailOptions);
            console.log(`Approval confirmation sent to ${approvedRequest.email}`);
            res.send('<h1>User Approved!</h1><p>A confirmation email has been sent to the user.</p>');
          } catch (emailError) {
            console.error('Approval confirmation email failed:', emailError);
            res.send('<h1>User Approved!</h1><p>User has been approved. (Note: Confirmation email failed to send.)</p>');
          }
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
          saveStorage(pendingRequests, approvedUsers); // Save changes to file
          console.log('User denied:', deniedRequest.username);

          const userMailOptions = {
              from: `"Your App Name" <t-anushka.shrivastava@ocltp.com>`,
              to: deniedRequest.email,
              subject: 'Update on your access request',
              html: `
                  <h3>Hello ${deniedRequest.username},</h3>
                  <p>After a review, we are unable to approve your access request at this time.</p>
              `
          };
          try {
            const freshTransporter = createTransporter();
            await freshTransporter.sendMail(userMailOptions);
            console.log(`Denial notification sent to ${deniedRequest.email}`);
            res.send('<h1>Request Denied</h1><p>A notification email has been sent to the user.</p>');
          } catch (emailError) {
            console.error('Denial notification email failed:', emailError);
            res.send('<h1>Request Denied</h1><p>Request has been denied. (Note: Notification email failed to send.)</p>');
          }
      } else {
          res.status(404).send('<h1>Invalid or expired token.</h1>');
      }
  } catch (error) {
      console.error('--- ERROR in /api/deny ---', error);
      res.status(500).send('<h1>An error occurred while processing the denial.</h1>');
  }
});

/**
 * Endpoint to view all pending requests (for debugging/admin purposes)
 */
app.get('/api/pending-requests', (req, res) => {
  try {
    // Reload from file to get latest data
    const { pendingRequests: currentPending } = loadStorage();
    console.log('Loaded pending requests from file:', currentPending.length);
    const cleanPending = cleanExpiredTokens(currentPending);
    console.log('After cleaning expired tokens:', cleanPending.length);
    
    // Update global variables to keep them in sync
    pendingRequests = cleanPending;
    
    res.json({
      count: cleanPending.length,
      requests: cleanPending.map(req => ({
        username: req.username,
        email: req.email,
        createdAt: req.createdAt,
        action: req.action || 'account_approval',
        token: req.approval_token ? req.approval_token.substring(0, 8) + '...' : 
               req.change_token ? req.change_token.substring(0, 8) + '...' : 'N/A'
      }))
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

/**
 * Endpoint to view all approved users (for debugging/admin purposes)
 */
app.get('/api/approved-users', (req, res) => {
  try {
    // Reload from file to get latest data
    const { approvedUsers: currentApproved } = loadStorage();
    
    res.json({
      count: currentApproved.length,
      users: currentApproved.map(user => ({
        username: user.username,
        email: user.email,
        approvedAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching approved users:', error);
    res.status(500).json({ error: 'Failed to fetch approved users' });
  }
});

/**
 * Endpoint to view all pending feature changes (for debugging/admin purposes)
 */
app.get('/api/pending-feature-changes', (req, res) => {
  try {
    // Reload from file to get latest data
    const { pendingChanges: currentPending } = loadFeatureChanges();
    console.log('Loaded pending feature changes from file:', currentPending.length);
    const cleanPending = cleanExpiredFeatureChanges(currentPending);
    console.log('After cleaning expired feature changes:', cleanPending.length);
    
    // Update global variables to keep them in sync
    pendingChanges = cleanPending;
    
    res.json({
      count: cleanPending.length,
      changes: cleanPending.map(change => ({
        username: change.username,
        email: change.email,
        action: change.action,
        featureName: change.flagData?.name || 'N/A',
        createdAt: change.createdAt,
        token: change.change_token.substring(0, 8) + '...'
      }))
    });
  } catch (error) {
    console.error('Error fetching pending feature changes:', error);
    res.status(500).json({ error: 'Failed to fetch pending feature changes' });
  }
});

/**
 * Endpoint to manually clean expired tokens
 */
app.post('/api/clean-expired-tokens', (req, res) => {
  try {
    const { pendingRequests: currentPending, approvedUsers: currentApproved } = loadStorage();
    const cleanPending = cleanExpiredTokens(currentPending);
    saveStorage(cleanPending, currentApproved);
    
    const cleanedCount = currentPending.length - cleanPending.length;
    res.json({ 
      message: `Cleaned ${cleanedCount} expired tokens`,
      remainingTokens: cleanPending.length
    });
  } catch (error) {
    console.error('Error cleaning expired tokens:', error);
    res.status(500).json({ error: 'Failed to clean expired tokens' });
  }
});

/**
 * Endpoint to get all feature flags
 */
app.get('/api/feature-flags', (req, res) => {
  try {
    const flags = loadFeatureFlags();
    res.json(flags);
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    res.status(500).json({ error: 'Failed to fetch feature flags' });
  }
});

/**
 * Endpoint to request feature flag changes (toggle, add, edit, delete)
 */
app.post('/api/request-feature-change', async (req, res) => {
  try {
    const { action, flagData, username, email } = req.body;
    
    if (!action || !username || !email) {
      return res.status(400).json({ message: 'Action, username, and email are required.' });
    }

    const changeToken = crypto.randomBytes(32).toString('hex');
    const changeRequest = {
      action,
      flagData,
      username,
      email,
      change_token: changeToken,
      createdAt: new Date().toISOString()
    };

    // Add to pending feature changes
    if (!pendingChanges.some(req => req.change_token === changeToken)) {
      pendingChanges.push(changeRequest);
      saveFeatureChanges(pendingChanges);
    }

    const approvalLink = `http://localhost:3001/api/approve-feature-change?token=${changeToken}`;
    const denyLink = `http://localhost:3001/api/deny-feature-change?token=${changeToken}`;

    const actionText = {
      'toggle': 'toggle the status of',
      'add': 'add a new feature flag',
      'edit': 'edit',
      'delete': 'delete'
    }[action] || action;

    const mailOptions = {
      from: '"Feature Flag Manager" <t-anushka.shrivastava@ocltp.com>',
      to: 't-anushka.shrivastava@ocltp.com',
      replyTo: email,
      subject: `Feature Flag Change Request: ${action.toUpperCase()}`,
      html: `
        <h3>Feature Flag Change Request</h3>
        <p><strong>User:</strong> ${username} (${email})</p>
        <p><strong>Action:</strong> ${actionText}</p>
        ${flagData ? `<p><strong>Feature:</strong> ${flagData.name || 'N/A'}</p>` : ''}
        ${flagData && flagData.description ? `<p><strong>Description:</strong> ${flagData.description}</p>` : ''}
        <p>Please review and choose an action:</p>
        <p style="margin: 20px 0;">
          <a href="${approvalLink}" style="padding: 12px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-right: 10px;">Approve</a>
          <a href="${denyLink}" style="padding: 12px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Deny</a>
        </p>
      `
    };

    try {
      const freshTransporter = createTransporter();
      await freshTransporter.sendMail(mailOptions);
      console.log(`Feature change request sent for user: ${username}, action: ${action}`);
      res.status(200).json({ message: 'Feature change request submitted! It will be reviewed by a manager.' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Still save the request even if email fails
      console.log(`Feature change request saved but email failed for user: ${username}, action: ${action}`);
      res.status(200).json({ 
        message: 'Feature change request submitted! It will be reviewed by a manager. (Note: Email notification failed, but request is saved.)' 
      });
    }

  } catch (error) {
    console.error('--- ERROR in /api/request-feature-change ---', error);
    res.status(500).json({ message: 'Server failed to process the feature change request.' });
  }
});

/**
 * Endpoint to approve feature flag changes
 */
app.get('/api/approve-feature-change', async (req, res) => {
  try {
    const { token } = req.query;
    console.log('Feature change approval attempt for token:', token.substring(0, 8) + '...');
    
    // Reload from file to get latest data
    const { pendingChanges: currentPending } = loadFeatureChanges();
    pendingChanges = currentPending;
    
    const requestIndex = pendingChanges.findIndex(req => req.change_token === token);

    if (requestIndex !== -1) {
      const [approvedRequest] = pendingChanges.splice(requestIndex, 1);
      saveFeatureChanges(pendingChanges);
      console.log('Feature change approved:', approvedRequest.action);

      // Apply the change to feature flags
      const flags = loadFeatureFlags();
      let updatedFlags = [...flags];

      switch (approvedRequest.action) {
        case 'toggle':
          const toggleFlag = updatedFlags.find(f => f.id === approvedRequest.flagData.id);
          if (toggleFlag) {
            toggleFlag.isEnabled = !toggleFlag.isEnabled;
          }
          break;
        case 'add':
          updatedFlags.push({
            id: new Date().toISOString(),
            ...approvedRequest.flagData
          });
          break;
        case 'edit':
          const editIndex = updatedFlags.findIndex(f => f.id === approvedRequest.flagData.id);
          if (editIndex !== -1) {
            updatedFlags[editIndex] = { ...updatedFlags[editIndex], ...approvedRequest.flagData };
          }
          break;
        case 'delete':
          updatedFlags = updatedFlags.filter(f => f.id !== approvedRequest.flagData.id);
          break;
      }

      saveFeatureFlags(updatedFlags);

      const userMailOptions = {
        from: `"Feature Flag Manager" <t-anushka.shrivastava@ocltp.com>`,
        to: approvedRequest.email,
        subject: 'Feature Flag Change Approved!',
        html: `
          <h3>Feature Flag Change Approved!</h3>
          <p>Hello ${approvedRequest.username},</p>
          <p>Your request to ${approvedRequest.action} the feature flag has been approved.</p>
          <p style="margin: 20px 0;">
            <a href="http://localhost:5173/feature-flags" style="padding: 12px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Dashboard</a>
          </p>
        `
                };
          try {
            const freshTransporter = createTransporter();
            await freshTransporter.sendMail(userMailOptions);
            console.log(`Approval confirmation sent to ${approvedRequest.email}`);
            res.send('<h1>Feature Change Approved!</h1><p>The change has been applied and a confirmation email has been sent to the user.</p>');
          } catch (emailError) {
            console.error('Feature change approval confirmation email failed:', emailError);
            res.send('<h1>Feature Change Approved!</h1><p>The change has been applied. (Note: Confirmation email failed to send.)</p>');
          }
    } else {
      res.status(404).send('<h1>Invalid or expired token.</h1>');
    }
  } catch (error) {
    console.error('--- ERROR in /api/approve-feature-change ---', error);
    res.status(500).send('<h1>An error occurred while processing the approval.</h1>');
  }
});

/**
 * Endpoint to deny feature flag changes
 */
app.get('/api/deny-feature-change', async (req, res) => {
  try {
    const { token } = req.query;
    
    // Reload from file to get latest data
    const { pendingChanges: currentPending } = loadFeatureChanges();
    pendingChanges = currentPending;
    
    const requestIndex = pendingChanges.findIndex(req => req.change_token === token);

    if (requestIndex !== -1) {
      const [deniedRequest] = pendingChanges.splice(requestIndex, 1);
      saveFeatureChanges(pendingChanges);
      console.log('Feature change denied:', deniedRequest.action);

      const userMailOptions = {
        from: `"Feature Flag Manager" <t-anushka.shrivastava@ocltp.com>`,
        to: deniedRequest.email,
        subject: 'Feature Flag Change Denied',
        html: `
          <h3>Feature Flag Change Denied</h3>
          <p>Hello ${deniedRequest.username},</p>
          <p>Your request to ${deniedRequest.action} the feature flag has been denied after review.</p>
        `
                };
          try {
            const freshTransporter = createTransporter();
            await freshTransporter.sendMail(userMailOptions);
            console.log(`Denial notification sent to ${deniedRequest.email}`);
            res.send('<h1>Feature Change Denied</h1><p>A notification email has been sent to the user.</p>');
          } catch (emailError) {
            console.error('Feature change denial notification email failed:', emailError);
            res.send('<h1>Feature Change Denied</h1><p>Feature change has been denied. (Note: Notification email failed to send.)</p>');
          }
    } else {
      res.status(404).send('<h1>Invalid or expired token.</h1>');
    }
  } catch (error) {
    console.error('--- ERROR in /api/deny-feature-change ---', error);
    res.status(500).send('<h1>An error occurred while processing the denial.</h1>');
  }
});

// --- 6. START THE SERVER ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Token storage file: ${STORAGE_FILE}`);
  console.log(`Feature changes file: ${FEATURE_CHANGES_FILE}`);
  console.log(`Token expiry: ${TOKEN_EXPIRY_HOURS} hours`);
});
