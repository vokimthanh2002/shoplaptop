// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const User = require('./models/user');
const Category = require('./models/category');
const Product = require('./models/product');
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const categoryController = require('./controllers/categoryController');
const userController = require('./controllers/userController');
const path = require('path'); // Thêm đoạn mã này
// require = require('esm')(module /*, options*/); // Enable ESM

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost/shopDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.set('view engine', 'ejs');

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
};
const requiredAdmin = (req, res, next) => {
  const user = req.session.user;

  if (!user) {
    res.redirect('/login');
  } else {
    if (user.isAdmin === false) {
      res.redirect('/');
    } else {
      // Only call next() when the user is logged in and is an admin
      next();
    }
  }
};

// Middleware to serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Ví dụ cấu hình MIME type cho express.static
app.use( express.static('views/admin'));
app.use( express.static('views/user'));

app.get('/', productController.showHome);
app.get('/product', productController.showProducts);
app.get('/product/:productId', productController.getProductDetail);
app.get('/product/cart', productController.showCart);
// Router edit profile
app.get('/profile', requireLogin, authController.getProfile);
app.get('/profile/edit', requireLogin, authController.getEditProfileForm);
app.post('/profile/edit', requireLogin, authController.editProfile);

// Route cho đổi mật khẩu
app.get('/profile/change-password', requireLogin, authController.getChangePasswordForm);
app.post('/profile/change-password', requireLogin, authController.changePassword);

// Routes for Authentication
app.get('/register', authController.getRegisterForm);
app.post('/register', authController.registerUser);
app.get('/login', authController.getLoginForm);
app.post('/login', authController.loginUser);
app.get('/logout', authController.logoutUser);


// Routes for User (protected by requireLogin middleware)
app.get('/admin/users', requireLogin, userController.getAllUsers);
app.get('/admin/users/add', requireLogin, userController.getAddUserForm);
app.post('/admin/users', requireLogin, userController.addUser);
app.get('/admin/users/edit/:id', requireLogin, userController.getEditUserForm);
app.post('/admin/users/:id', requireLogin, userController.editUser);
app.get('/admin/users/delete/:id', requireLogin, userController.deleteUser);
app.get('/admin/users/search', requireLogin, userController.searchUser);
// Routes for Product (protected by requireLogin middleware)
app.get('/admin/products', requiredAdmin,requireLogin, productController.getAllProducts);
app.get('/admin/products/add', requireLogin, productController.getAddProductForm);
app.post('/admin/products', requireLogin, productController.addProduct);
app.get('/admin/products/edit/:id', requireLogin, productController.getEditProductForm);
app.post('/admin/products/:id', requireLogin, productController.editProduct);
app.get('/admin/products/delete/:id', requireLogin, productController.deleteProduct);
app.get('/admin/products/search', requireLogin, productController.searchProducts);
// Router cho tìm kiếm theo danh mục
app.get('/admin/products/category/:id',requireLogin, productController.searchByCategory);

// Routes for Category (protected by requireLogin middleware)
app.get('/admin/categories', requireLogin, categoryController.getAllCategories);
app.get('/admin/categories/add', requireLogin, categoryController.getAddCategoryForm);
app.post('/admin/categories', requireLogin, categoryController.addCategory);
app.get('/admin/categories/edit/:id', requireLogin, categoryController.getEditCategoryForm);
app.post('/admin/categories/:id', requireLogin, categoryController.editCategory);
app.get('/admin/categories/delete/:id', requireLogin, categoryController.deleteCategory);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
