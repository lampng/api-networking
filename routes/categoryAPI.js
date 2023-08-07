require('colors')
// mongodb user model
const categoryModel = require('../models/categoryModel');
require('dotenv').config();
//Tải lên ảnh
const cloudinary = require('../middleware/cloudinary.js');
const upload = require('../middleware/upload');
const path = require('path');
var bcrypt = require('bcryptjs');
var express = require('express');
var router = express.Router();
router.get('/', (req, res) => {
    res.json({
        status: "API ON",
    })
})
router.post('/create', upload.single("image"), async (req, res) => {
    try {
        //Kiểm tra trùng lặp tên loại
        const nameCheck = await categoryModel.findOne({
            name: req.body.name
        });
        if (nameCheck) {
            return res.status(400).json({
                message: `[${req.body.name}] đã tồn tại trong hệ thống`
            });
        }
        if (req.file != null) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "android-networking/categorys"
            });
            const newCat = new categoryModel({
                name: req.body.name,
                image: result.secure_url,
                cloudinary_id: result.public_id
            });
            try {
                await newCat.save();
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
        res.json({
            message: `[${req.body.name}] không được thêm vào hệ thống | Dòng 54`
        });
        console.log(`❗  [${req.body.name}] không được thêm vào hệ thống`.bgRed.white.bold);
    }
})
//Gọi danh sách loại
router.get('/list', async (req, res) => {
    try {
        const category = await categoryModel.find({});
        res.status(200).json(category);
        console.log(`✅ Gọi danh sách danh mục thành công`.green.bold);
    } catch (error) {
        console.log(`❗  ${error.message}`.bgRed.white.strikethrough.bold);
        res.status(500).json({
            message: error.message
        })
    }
})
//Gọi chi tiết loại
router.get('/detail/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const category = await categoryModel.findById(id);
        res.status(200).json(category);
        console.log(`✅ Gọi chi tiết danh mục thành công`.green.bold);
    } catch (error) {
        console.log(`❗  ${error.message}`.bgRed.white.strikethrough.bold);
        res.status(500).json({
            message: error.message
        })
        console.log(`❗  Gọi chi tiết danh mục thất bại`.bgRed.white.strikethrough.bold);
    }
})
//Cập nhập danh mục
router.put('/update/:id', upload.single("image"), async (req, res) => {
    try {
        const {
            id
        } = req.params;
        let cat = await categoryModel.findById(id);
        if (req.file != null) {
            await cloudinary.uploader.destroy(cat.cloudinary_id);
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "android-networking/categorys"
            });
            const data = {
                name: req.body.name || cat.name,
                image: result.secure_url || cat.avatar,
                cloudinary_id: result.public_id || cat.cloudinary_id,
            }
            await categoryModel.findByIdAndUpdate(id, data, {
                    new: true
                })
                .then(doc => {
                    res.json({
                        status: "Cập nhập danh mục dùng thành công"
                    })
                    console.log(`✅  Cập nhập danh mục thành công`.green.bold);
                })
                .catch(err => {
                    console.log(`Lỗi catch: `.bgRed, err);
                });
        } else {
            const data = {
                name: req.body.name || cat.name,
            }
            await categoryModel.findByIdAndUpdate(id, data, {
                    new: true
                })
                .then(doc => {
                    res.json({
                        status: "Cập nhập danh mục dùng thành công"
                    })
                    console.log(`✅  Cập nhập danh mục thành công`.green.bold);
                })
                .catch(err => {
                    console.log(`Lỗi catch: `.bgRed, err);
                });
        }
    } catch (error) {
        console.log(`❗  ${error.message}`.bgRed.white.strikethrough.bold);
        res.status(500).json({
            message: error.message
        })
        console.log(`❗  Cập nhập thất bại`.bgRed.white.strikethrough.bold);
    }
})
// Xoá danh mục
router.delete('/delete/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const cat = await categoryModel.findByIdAndDelete(id);
        if (!cat) {
            return res.status(404).json({
                message: `Không tìm thấy người dùng`
            })
        }
        await cloudinary.uploader.destroy(cat.cloudinary_id)
        res.status(200).json(cat);
        console.log(`✅ Xoá thành công`.green.bold);
    } catch (error) {
        console.log(`❗  ${error.message}`.bgRed.white.strikethrough.bold);
        res.status(500).json({
            message: error.message
        })
    }
})
module.exports = router;