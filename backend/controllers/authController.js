const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SoilTest = require('../models/SoilTest');
const { JWT_SECRET } = require('../middleware/auth');

function generateToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
}

// 1. Register User (Creates fresh, clean account with zero pre-loaded test data)
async function register(req, res) {
  try {
    const { name, email, password, role, state, district, village, plotName, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = typeof password === 'string' ? password.trim() : password;

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: `An account with email "${cleanEmail}" already exists. Please sign in instead.` });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: cleanPassword,
      role: role || 'farmer',
      state: state || 'Punjab',
      district: district || 'Ludhiana',
      village: village || 'Jagraon',
      plotName: plotName || 'Field Block A',
      phone: phone || ''
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        state: user.state,
        district: user.district,
        village: user.village,
        plotName: user.plotName,
        phone: user.phone,
        token
      }
    });
  } catch (err) {
    console.error('[Auth register error]:', err);
    return res.status(500).json({ success: false, message: err.message, error: err.message });
  }
}

// 2. Login User
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = typeof password === 'string' ? password.trim() : password;

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `No account found with email "${cleanEmail}". Please check spelling or register.`
      });
    }

    let isMatch = await user.matchPassword(password);
    if (!isMatch && cleanPassword !== password) {
      isMatch = await user.matchPassword(cleanPassword);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password for this account. Please verify your password and try again.'
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        state: user.state,
        district: user.district,
        village: user.village,
        plotName: user.plotName,
        phone: user.phone,
        token
      }
    });
  } catch (err) {
    console.error('[Auth login error]:', err);
    return res.status(500).json({ success: false, message: err.message, error: err.message });
  }
}

// 3. Get Current User Profile
async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, error: err.message });
  }
}

// 4. One-Click Demo Role Switcher
async function switchDemoProfile(req, res) {
  try {
    const { role } = req.body;
    const targetRole = role || 'farmer';

    const demoEmails = {
      farmer: 'farmer@soilsense.in',
      agronomist: 'agronomist@soilsense.in',
      student: 'student@nitdelhi.ac.in'
    };

    const targetEmail = demoEmails[targetRole] || demoEmails.farmer;
    let user = await User.findOne({ email: targetEmail });

    if (!user) {
      const demoUsers = {
        farmer: {
          name: 'Ramesh Kumar',
          email: 'farmer@soilsense.in',
          password: 'farmerpassword123',
          role: 'farmer',
          state: 'Punjab',
          district: 'Ludhiana',
          village: 'Jagraon',
          plotName: 'Plot 01'
        },
        agronomist: {
          name: 'Dr. Preeti Sharma',
          email: 'agronomist@soilsense.in',
          password: 'agropassword123',
          role: 'agronomist',
          state: 'Punjab',
          district: 'Ludhiana',
          village: 'PAU Campus',
          plotName: 'Research Station Block C'
        },
        student: {
          name: 'Rahul Verma (NIT Delhi)',
          email: 'student@nitdelhi.ac.in',
          password: 'studentpassword123',
          role: 'student',
          state: 'Delhi',
          district: 'North Delhi',
          village: 'Bakoli',
          plotName: 'Campus Agri-Lab Zone'
        }
      };

      const profile = demoUsers[targetRole] || demoUsers.farmer;
      user = await User.create(profile);
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: `Switched to ${user.role} profile: ${user.name}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        state: user.state,
        district: user.district,
        village: user.village,
        plotName: user.plotName,
        phone: user.phone,
        token
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 5. Get All Registered Accounts (for account switcher)
async function getAllAccounts(req, res) {
  try {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 6. Direct Account Switcher
async function switchAccount(req, res) {
  try {
    const { email, userId } = req.body;
    let query = {};
    if (userId) query._id = userId;
    else if (email) query.email = email.trim().toLowerCase();
    else {
      return res.status(400).json({ success: false, message: 'Please provide email or userId' });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: `Switched to account: ${user.name} (${user.email})`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        state: user.state,
        district: user.district,
        village: user.village,
        plotName: user.plotName,
        phone: user.phone,
        token
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 7. Delete User Account from System / Switcher List
async function deleteAccount(req, res) {
  try {
    const accountId = req.params?.id || req.body?.userId;
    const email = req.body?.email;

    let query = {};
    if (accountId) query._id = accountId;
    else if (email) query.email = email.trim().toLowerCase();
    else {
      return res.status(400).json({ success: false, message: 'Please specify account ID or email to remove' });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Protect the 3 demo accounts
    const DEMO_EMAILS = ['farmer@soilsense.in', 'agronomist@soilsense.in', 'student@nitdelhi.ac.in'];
    if (DEMO_EMAILS.includes((user.email || '').toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Official demo profiles cannot be deleted.' });
    }

    // Delete user and associated soil tests
    await Promise.all([
      User.deleteOne({ _id: user._id }),
      SoilTest.deleteMany({ userId: user._id })
    ]);

    return res.json({
      success: true,
      message: `Account ${user.name} (${user.email}) deleted successfully.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  register,
  login,
  getMe,
  switchDemoProfile,
  demoSwitch: switchDemoProfile,
  getAllAccounts,
  switchAccount,
  deleteAccount
};
