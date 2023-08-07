require('colors')
// mongodb user model
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
require('dotenv').config();
//Tải lên ảnh
const cloudinary = require('../middleware/cloudinary.js');
const upload = require('../middleware/upload');
const path = require('path');
var express = require('express');
var router = express.Router();
router.get('/', (req, res) => {
    res.json({
        status: "API ON",
    })
})
router.post('/create', upload.single("image"), async (req, res) => {
    try {
        const nameCheck = await productModel.findOne({
            name: req.body.name
        });
        if (nameCheck) {
            return res.status(400).json({
                message: `[${req.body.name}] đã tồn tại trong hệ thống`
            });
        }
        if (req.file != null) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "android-networking/products"
            });
            // const getIdCatByName = getCategoryIdByName('Bánh');
            let cat = await categoryModel.findOne({name: 'Bánh'});
            const data = new productModel({
                cat_ID: cat._id,
                name: req.body.name,
                des: req.body.des,
                price: req.body.price,
                imageProduct: result.secure_url,
                cloudinary_id: result.public_id
            });
            try {
                await data.save();
                res.json({
                    message: `[${req.body.name}] Đã được thêm vào hệ thống`
                });
                console.log(`✅  [${req.body.name}] Đã được thêm vào hệ thống`.green.bold);
            } catch (error) {
                res.json({
                    message: `[${req.body.name}] không được thêm vào hệ thống`
                });
                console.log(`❗  [${req.body.name}] không được thêm vào hệ thống`.bgRed.white.bold);
            }
        } else {
            return res.json({
                message: 'Vui lòng thêm hình ảnh cho ' + `[${req.body.name}]`
            })
        }
    } catch (error) {
        console.log(`❗  ${error}`.bgRed.white.strikethrough.bold);
    }
})
//Gọi danh sách sản phẩm
router.get('/list', async (req, res) => {
    try {
        const product = await productModel.find({});
        res.status(200).json(product);
        console.log(`✅ Gọi danh sách sản phẩm thành công`.green.bold);
    } catch (error) {
        console.log(`❗  ${error.message}`.bgRed.white.strikethrough.bold);
        res.status(500).json({
            message: error.message
        })
    }
})
//==========================================================================
async function getCategoryIdByName(categoryName) {
    try {
        const category = await categoryModel.findOne({
            name: categoryName
        });
        if (!category) {
            console.log(`Category "${categoryName}" not found.`);
            return null;
        }
        console.log(`✅  Success getCategoryIdByName: ${category._id} `.green.bold);
        return category._id;
    } catch (err) {
        console.error('Error retrieving category ID:', err);
        return null;
    }
}
async function getCategoryNameById(categoryId) {
    try {
        const category = await categoryModel(categoryId);
        if (!category) {
            console.log('Category not found.');
            return;
        }
        console.log('Category Name:', category.name);
    } catch (err) {
        console.error('Error retrieving category name:', err);
    }
}
module.exports = router;