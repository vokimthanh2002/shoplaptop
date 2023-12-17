

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      next();
    }
  };
  // Middleware to serve static files from the "uploads" directory
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  // Routes for Authentication
  app.get('/register', authController.getRegisterForm);
  app.post('/register', authController.registerUser);
  app.get('/login', authController.getLoginForm);
  app.post('/login', authController.loginUser);
  app.get('/logout', authController.logoutUser);
  // Router edit profile
  app.get('/profile/edit', requireLogin, authController.getEditProfileForm);
  app.post('/profile', requireLogin, authController.editProfile);
  
  // Routes for Product (protected by requireLogin middleware)
  app.get('/products', requireLogin, productController.getAllProducts);
  app.get('/products/add', requireLogin, productController.getAddProductForm);
  app.post('/products', requireLogin, productController.addProduct);
  app.get('/products/edit/:id', requireLogin, productController.getEditProductForm);
  app.post('/products/:id', requireLogin, productController.editProduct);
  app.get('/products/delete/:id', requireLogin, productController.deleteProduct);
  app.get('/products/search', requireLogin, productController.searchProducts);
  
  // Routes for Category (protected by requireLogin middleware)
  app.get('/categories', requireLogin, categoryController.getAllCategories);
  app.get('/categories/add', requireLogin, categoryController.getAddCategoryForm);
  app.post('/categories', requireLogin, categoryController.addCategory);
  app.get('/categories/edit/:id', requireLogin, categoryController.getEditCategoryForm);
  app.post('/categories/:id', requireLogin, categoryController.editCategory);
  app.get('/categories/delete/:id', requireLogin, categoryController.deleteCategory);