// controllers/authController.js
const User = require('../models/user');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Tạo tên file mới để tránh trùng lặp
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Khai báo middleware multer
const upload = multer({ storage: storage });

// Middleware để xử lý tải lên hình ảnh
const handleImageUpload = upload.single('image');

exports.getRegisterForm = (req, res) => {
  res.render('auth/register');
};

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const isAdmin = false;
    const newUser = new User({ username, email, password,isAdmin});
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

// controllers/authController.js
exports.getLoginForm = (req, res) => {
    const query = req.query; // Truy cập các tham số truy vấn từ yêu cầu
  
    res.render('auth/login', { query });
  };
  

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await user.comparePassword(password))) {
      // Đăng nhập thành công, thực hiện các hành động cần thiết
      // Ví dụ: Lưu thông tin người dùng vào session
      req.session.user = user;
      if(user.isAdmin === false){
        res.redirect('/'); // Điều hướng đến trang dashboard hoặc nơi khác
      }else
        res.redirect('/admin/products'); // Điều hướng đến trang dashboard hoặc nơi khác
    } else {
      res.redirect('/login?error=1'); // Đăng nhập không thành công, chuyển hướng với thông báo lỗi
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.logoutUser = (req, res) => {
  // Xóa thông tin người dùng khỏi session
  req.session.destroy();
  res.redirect('/login');
};

exports.getEditProfileForm = (req, res) => {
  res.render('user/auth/editProfile', { user: req.session.user });
};

exports.getProfile = async (req, res) => {
  try {
    res.render('user/auth/profile', { user: req.session.user });
    console.log(req.session.user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.editProfile = async (req, res) => {
  try {
    handleImageUpload(req, res, async function (err) {
      const { phone, address, deleteImage } = req.body;

      // Xác định xem có chọn xóa hình ảnh hay không
      if (deleteImage) {
        req.body.image = null;
      }


      // Lưu thông tin cập nhật vào người dùng
      const updatedUser = await User.findByIdAndUpdate(
        req.session.user._id,
        { phone, address, image: req.file ? req.file.filename : req.session.user.image},
        { new: true }  // Trả về người dùng sau khi cập nhật
      );
      // console.log(updatedUser)

      // Lưu thông tin người dùng mới vào session
      req.session.user = updatedUser;

      res.redirect('/profile');
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.getChangePasswordForm = (req,  res) => {
  res.render('user/auth/changePass', { error: null,  user: req.session.user });
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.session.user._id);

    // Kiểm tra xác thực mật khẩu hiện tại
    const isPasswordValid = await user.comparePassword(currentPassword);
    let error;
    if (!isPasswordValid) {
      error = 'Invalid current password. Please try again.';
      return res.render('user/auth/changePass', { error });
    }

    // Kiểm tra xác nhận mật khẩu mới
    if (newPassword !== confirmPassword) {
      error = 'New password and confirm password do not match. Please try again.';
      return res.render('user/auth/changePass', { error });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.redirect('/profile'); // Chuyển hướng sau khi thay đổi mật khẩu thành công
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};
