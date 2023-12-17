const User = require("../models/user");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Cấu hình multer để lưu trữ hình ảnh trong thư mục 'uploads'
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

exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({});
      res.render('admin/user/index', { users, user: req.session.user });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  };

  exports.getAddUserForm = (req, res) => {
    res.render('admin/user/add', { user: req.session.user});
  };
  exports.addUser = async (req, res) => {
    try {
      // Xử lý tải lên hình ảnh trước khi tạo sản phẩm
      handleImageUpload(req, res, async function (err) {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
  
        const { username, email, password, phone,address } = req.body;
        const image = req.file ? req.file.filename : ''; // Kiểm tra nếu có hình ảnh tải lên
  
        const newUser = new User({ username, email, password, phone,address, image });
        await newUser.save();
  
        res.redirect('/admin/users');
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  };
  
  exports.getEditUserForm = async (req, res) => {
    try {
      const users = await User.findById(req.params.id);
      res.render('admin/user/edit', { users, user: req.session.user});
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  };
  
  exports.editUser = async (req, res) => {
    try {
       // Xử lý tải lên hình ảnh trước khi tạo sản phẩm
       handleImageUpload(req, res, async function (err) {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
        const {  password, phone,address } = req.body;
        const userId = req.params.id;
    
        // Kiểm tra xem có ảnh mới được tải lên hay không
        if (req.file) {
          // Nếu có, xử lý tải lên ảnh mới
          const image = req.file.filename;
          // Cập nhật thông tin sản phẩm với ảnh mới
          await User.findByIdAndUpdate(userId, {  password, phone,address, image: image });
        } else {
          // Nếu không có ảnh mới, kiểm tra xem người dùng muốn xóa ảnh hiện tại hay không
          if (req.body.deleteImage === 'on') {
            // Nếu muốn xóa, cập nhật thông tin sản phẩm không có đường dẫn ảnh
            await User.findByIdAndUpdate(userId, {  password, phone,address, image: '' });
          } else {
            // Nếu không muốn xóa, giữ nguyên ảnh hiện tại
            await User.findByIdAndUpdate(userId, {  password, phone,address });
          }
        }
  
        res.redirect('/admin/users');
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  };
  
  
  exports.deleteUser = async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.redirect('/admin/users');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  };
  exports.searchUser = async (req, res) => {
    try {
      const { keyword } = req.query;
      const users = await User.find({
        $or: [
          { username: { $regex: keyword, $options: 'i' } },
          { email: { $regex: keyword, $options: 'i' } },
        ],
      })
      res.render('admin/user/index', { users,user: req.session.user });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  };