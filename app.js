import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import db from './db/database.mjs'; 
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Login page route
app.get('/', (req, res) => res.render('login', { errorMessage: null }));

// Handle login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [user] = await db.query('SELECT * FROM t_login WHERE f_userName = ?', [username]);
    if (!user.length || !bcrypt.compareSync(password, user[0].f_Pwd)) {
      return res.render('login', { errorMessage: 'Invalid login details' });
    }
    req.session.user = username;
    res.redirect('/dashboard');
  } catch {
    res.render('login', { errorMessage: 'An error occurred, please try again' });
  }
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.render('dashboard', { user: req.session.user });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Employee list route
app.get('/employees', async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const [employees] = await db.query('SELECT * FROM t_employee WHERE f_Name LIKE ? OR f_Email LIKE ?', [`%${searchQuery}%`, `%${searchQuery}%`]);
    res.render('employeeList', { employees });
  } catch {
    res.render('employeeList', { employees: [], errorMessage: 'An error occurred while fetching employees.' });
  }
});

// Employee image route
app.get('/employee-image/:id', async (req, res) => {
  try {
    const [employee] = await db.query('SELECT f_Image FROM t_employee WHERE f_Id = ?', [req.params.id]);
    if (employee.length && employee[0].f_Image) {
      res.contentType('image/jpeg').send(employee[0].f_Image);
    } else {
      res.status(404).send('Image not found');
    }
  } catch {
    res.status(500).send('Error retrieving the image');
  }
});

// Create employee form route
app.get('/create-employee', (req, res) => res.render('createEmployee'));

// Handle creating an employee
app.post('/create-employee', upload.single('image'), async (req, res) => {
  const { name, email, mobile, designation, gender, course } = req.body;
  const image = req.file ? req.file.buffer : null;
  try {
    await db.query('INSERT INTO t_employee (f_Name, f_Email, f_Mobile, f_Designation, f_Gender, f_Course, f_Image, f_Createdate) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', 
      [name, email, mobile, designation, gender, course, image]);
    res.redirect('/employees');
  } catch {
    res.status(500).send('An error occurred while creating the employee.');
  }
});

// Edit employee form route
app.get('/edit-employee/:id', async (req, res) => {
  try {
    const [employee] = await db.query('SELECT * FROM t_employee WHERE f_Id = ?', [req.params.id]);
    if (employee.length) {
      res.render('editEmployee', { employee: employee[0] });
    } else {
      res.redirect('/employees');
    }
  } catch {
    res.redirect('/employees');
  }
});

// Handle employee update
app.post('/edit-employee/:id', upload.single('image'), async (req, res) => {
  const { name, email, mobile, designation, gender, course, oldImage } = req.body;
  const image = req.file ? req.file.buffer : oldImage;
  try {
    await db.query('UPDATE t_employee SET f_Name = ?, f_Email = ?, f_Mobile = ?, f_Designation = ?, f_Gender = ?, f_Course = ?, f_Image = ? WHERE f_Id = ?', 
      [name, email, mobile, designation, gender, course, image, req.params.id]);
    res.redirect('/employees');
  } catch {
    res.redirect(`/edit-employee/${req.params.id}`);
  }
});

// Handle employee deletion
app.get('/delete-employee/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM t_employee WHERE f_Id = ?', [req.params.id]);
    res.redirect('/employees');
  } catch {
    res.redirect('/employees');
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
