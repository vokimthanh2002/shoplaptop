// controllers/categoryController.js
const Category = require('../models/category');
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render('admin/categories/index', { categories, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.getAddCategoryForm = (req, res) => {
  res.render('admin/categories/add', { user: req.session.user});
};

exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.getEditCategoryForm = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    res.render('admin/categories/edit', { category , user: req.session.user});
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.editCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    console.log(name, description)
    await Category.findByIdAndUpdate(req.params.id, { name, description });
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};
