// controllers/productController.js
const Product = require('../models/product');
const Category = require('../models/category');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { log } = require('console');
const ITEMS_PER_PAGE = 8; 
// hiển thị ảnh
// exports.getImage = async (req, res) => {
//   const imageName = req.params.imageName;
//   const imagePath = path.join(__dirname, '../uploads', imageName);

//   try {
//     const data = await fs.readFile(imagePath);
//     res.writeHead(200, { 'Content-Type': 'image/' + path.extname(imagePath).substring(1) });
//     res.end(data);
//   } catch (err) {
//     console.error(err);
//     res.status(404).send('Không tìm thấy ảnh');
//   }
// };
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

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category');
    const categories = await Category.find({});
    res.render('admin/products/index', { products, categories, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.getAddProductForm = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render('admin/products/add', { categories, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.addProduct = async (req, res) => {
  try {
    // Xử lý tải lên hình ảnh trước khi tạo sản phẩm
    handleImageUpload(req, res, async function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }

      const { name, price, description, category } = req.body;
      const image = req.file ? req.file.filename : ''; // Kiểm tra nếu có hình ảnh tải lên

      const newProduct = new Product({ name, price, description, category, image });
      await newProduct.save();

      res.redirect('/admin/products');
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};


exports.getEditProductForm = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    const categories = await Category.find({});
    res.render('admin/products/edit', { product, categories, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.editProduct = async (req, res) => {
  try {
     // Xử lý tải lên hình ảnh trước khi tạo sản phẩm
     handleImageUpload(req, res, async function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
      const { name, price, description, category } = req.body;
      const productId = req.params.id;
      console.log(name, price, description, category)
  
      // Kiểm tra xem có ảnh mới được tải lên hay không
      if (req.file) {
        // Nếu có, xử lý tải lên ảnh mới
        const image = req.file.filename;
        // Cập nhật thông tin sản phẩm với ảnh mới
        await Product.findByIdAndUpdate(productId, { name, price, description, category, image: image });
      } else {
        // Nếu không có ảnh mới, kiểm tra xem người dùng muốn xóa ảnh hiện tại hay không
        if (req.body.deleteImage === 'on') {
          // Nếu muốn xóa, cập nhật thông tin sản phẩm không có đường dẫn ảnh
          await Product.findByIdAndUpdate(productId, { name, price, description, category, image: '' });
        } else {
          // Nếu không muốn xóa, giữ nguyên ảnh hiện tại
          await Product.findByIdAndUpdate(productId, { name, price, description, category });
        }
      }

      res.redirect('/admin/products');
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ],
    }).populate('category');
    const categories = await Category.find({});
    res.render('admin/products/index', { products, categories,user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};
exports.searchByCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const categories = await Category.find({});
    console.log(categories)
    // Thực hiện truy vấn để lấy các sản phẩm thuộc danh mục
    const products = await Product.find({ category: categoryId }).populate('category');
    console.log(products)

    // Render giao diện với danh sách sản phẩm thu được
    res.render('admin/products/index', { products, categories, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

//User
exports.showHome = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category');
    const categories = await Category.find({});
    res.render('user/index', { products, categories, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.showProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const products = await Product.paginate({}, { page, limit: ITEMS_PER_PAGE, populate: 'category' });
    const categories = await Category.find({});
    res.render('user/products/index', {
      products: products.docs,
      currentPage: page,
      hasNextPage: products.hasNextPage,
      hasPrevPage: products.hasPrevPage,
      totalPages: products.totalPages,
      categories,
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.getProductDetail = async (req, res) => {
  try {
      const productId = req.params.productId;
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).send('Invalid product ID');
    }
      const product = await Product.findById(productId).populate('category');
      const categories = await Category.find({});
      const products = await Product.find({}).populate('category');

      if (!product) {
          return res.status(404).send('Product not found');
      }

      res.render('user/products/detail', { product, products, categories,  user: req.session.user });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};

exports.showCart = (req, res) => {
  try {
    // Lấy giỏ hàng từ session hoặc cơ sở dữ liệu
  const cart = req.session.cart || {}; // Nếu không có giỏ hàng, tạo một giỏ hàng mới

  // Render trang giỏ hàng và truyền giỏ hàng vào để hiển thị thông tin
  res.render('user/products/cart', { cart, user: req.session.user });
} catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
}
  
};
