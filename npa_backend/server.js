require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Session Setup (MUST be before routes)
app.use(session({
  secret: 'npa-secret-2026',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, secure: false }
}));

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Ensure uploads folder
if (!fs.existsSync('./public/uploads')) {
  fs.mkdirSync('./public/uploads', { recursive: true });
}

// ✅ In-Memory Storage & Credentials
const VALID_ADMIN = { email: 'admin@npaexpols.com', password: 'Admin@123' };
const users = [];
const expolsData = [];
const ambassadorData = [];

// ✅ Auth Middleware
function requireLogin(req, res, next) {
  if (req.session.loggedIn) return next();
  res.redirect('/login');
}

// ==================== PUBLIC ROUTES ====================
app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    return res.redirect(req.session.user?.role === 'admin' ? '/admin' : '/index.html');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    return res.redirect(req.session.user?.role === 'admin' ? '/admin' : '/index.html');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// ==================== AUTH API ====================
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // 🔐 Admin Login
  if (email === VALID_ADMIN.email && password === VALID_ADMIN.password) {
    req.session.loggedIn = true;
    req.session.user = { email, role: 'admin' };
    console.log('✅ Admin login successful → /admin');
    return res.json({ success: true, redirect: '/admin' });
  }

  // 👤 Regular User Login
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    req.session.loggedIn = true;
    req.session.user = { email, role: 'user' };
    console.log('✅ User login successful → /index.html');
    return res.json({ success: true, redirect: '/index.html' });
  }

  console.log('❌ Login failed');
  res.status(401).json({ success: false, message: 'Invalid email or password' });
});

app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.json({ success: false, message: 'User already exists' });
  }
  users.push({ email, password, createdAt: new Date() });
  res.json({ success: true, message: 'Account created! Please login.' });
});

app.get('/api/check-auth', (req, res) => {
  res.json({ loggedIn: !!req.session.loggedIn, user: req.session.user || null });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ==================== PROTECTED ROUTES ====================
app.get('/index.html', requireLogin, (req, res) => {
  if (req.session.user?.role === 'admin') return res.redirect('/admin');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🎯 ADMIN DASHBOARD - PROTECTED & SERVES admin/dashboard.html
app.get('/admin', requireLogin, (req, res) => {
  if (req.session.user?.role !== 'admin') return res.redirect('/index.html');
  
  const adminPath = path.join(__dirname, 'public', 'admin', 'dashboard.html');
  if (fs.existsSync(adminPath)) {
    res.sendFile(adminPath);
  } else {
    res.status(404).send('Admin dashboard not found. Ensure public/admin/dashboard.html exists.');
  }
});

app.get('/form.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

app.get('/ambasador-registration.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ambasador-registration.html'));
});

// ==================== FILE UPLOADS ====================
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/register/expols', requireLogin, upload.fields([{ name: 'passport' }, { name: 'ssceCert' }]), (req, res) => {
  const entry = {
    id: Date.now(), status: 'pending', ...req.body,
    passport: req.files?.passport?.[0]?.filename ? `/uploads/${req.files.passport[0].filename}` : '',
    ssceCert: req.files?.ssceCert?.[0]?.filename ? `/uploads/${req.files.ssceCert[0].filename}` : '',
    registeredAt: new Date().toISOString()
  };
  expolsData.push(entry);
  res.json({ success: true });
});

app.post('/register/ambassador', requireLogin, upload.fields([{ name: 'passport' }, { name: 'supportDoc' }]), (req, res) => {
  const entry = {
    id: Date.now(), status: 'pending', ...req.body,
    passport: req.files?.passport?.[0]?.filename ? `/uploads/${req.files.passport[0].filename}` : '',
    supportDoc: req.files?.supportDoc?.[0]?.filename ? `/uploads/${req.files.supportDoc[0].filename}` : '',
    registeredAt: new Date().toISOString()
  };
  ambassadorData.push(entry);
  res.json({ success: true });
});

// ==================== DATA API ====================
app.get('/api/expols', requireLogin, (req, res) => {
  res.json({ count: expolsData.length, data: expolsData });
});

app.get('/api/ambassadors', requireLogin, (req, res) => {
  res.json({ count: ambassadorData.length, data: ambassadorData });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`🔐 Login: http://localhost:${PORT}/login`);
  console.log(`📊 User Dashboard: http://localhost:${PORT}/index.html`);
  console.log(`🎯 Admin Panel: http://localhost:${PORT}/admin`);
});