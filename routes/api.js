require('colors')
// mongodb user model
const userModels = require('../models/userModel');
require('dotenv').config();
//Tải lên ảnh
const cloudinary = require('../middleware/cloudinary.js');
const upload = require('../middleware/upload');
const path = require('path');
var bcrypt = require('bcryptjs');
var express = require('express');
var router = express.Router();
const fs = require('fs');
router.get('/', (req, res) => {
    res.json({
        status: "API ON",
        "Đăng ký(POST):": "https://phanlam-api.vercel.app/user/register",
        "Đăng nhập(POST):": "https://phanlam-api.vercel.app/user/login",
        "Đăng xuất(GET):": "https://phanlam-api.vercel.app/user/logout",
        "Cập nhập người dùng(PUT):": "https://phanlam-api.vercel.app/user/update/:id",
        "Xoá người dùng(DELETE):": "https://phanlam-api.vercel.app/user/delete/:id",
        "Gọi danh sách người dùng(GET):": "https://phanlam-api.vercel.app/user/list",
        "Gọi chi tiết người dùng(GET):": "https://phanlam-api.vercel.app/user/detail/:id",
    })
})
// register
//Đăng ký
//Lưu ý: "Key" ở trong form-data phải cùng tên với (upload.single("image"))
router.post('/register', upload.single("image"), async (req, res) => {
    try {

        const emailCheck = await userModels.findOne({
            email: req.body.email
        });
        const phoneCheck = await userModels.findOne({
            phone: req.body.phone,
        });
        if (emailCheck) {
            return res.status(400).json({
                message: 'Email đã tồn tại'
            });
        } else if (phoneCheck) {
            return res.status(400).json({
                message: 'Số điện thoại đã tồn tại'
            });
        }
        // Tạo người dùng mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);





        if (req.file != null) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "android-networking/users"
            });
            const newUser = new userModels({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                address: req.body.address,
                phone: req.body.phone,
                role: "client",
                avatar: result.secure_url,
                cloudinary_id: result.public_id
            });
            try {
                await newUser.save();
                res.json({
                    message: 'Đăng ký thành công'
                });
                console.log(`✅  Đăng ký thành công`.green.bold);
            } catch (error) {
                res.json({
                    message: 'Đăng ký không thành công'
                });
                console.log(`❗  Đăng ký không thành công`.bgRed.white.bold);
            }
        } else {
            const newUser = new userModels({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                address: req.body.address,
                phone: req.body.phone,
                role: "client",
            });
        }
        // =============================================

    } catch (error) {
        console.log(`ERRORR: ${error}`.bgRed.white);
    }
})
//Đăng nhập
router.post('/login', async (req, res) => {
    try {
        const check = await userModels.findOne({
            email: req.body.email
        });
        const {
            password
        } = req.body;
        const isMatch = await bcrypt.compare(password, check.password);
        await userModels.findOne({
            email: req.body.email
        }).then(data => {
            if (data) {
                if (check.password != null) {
                    if (isMatch) {

                        var manager = check.role;
                        console.log(`========= ✅  Login success | ${check.role} =========`.green.bold);
                        req.session.user = check.email;
                        req.session._id = check._id
                        req.session.loggedin = true;
                        console.log(`Status user log: `.red.bold + ` [${req.session.loggedin}]`.white.bold);
                        console.log(`Email user log:  `.red.bold + `[${req.session.user}]`.white.bold);
                        console.log(`ID user log: `.red.bold + `[${req.session._id}]`.white.bold);
                        req.session.role = manager;
                        if (manager == "admin") {
                            (manager = "Manager");
                        } else {
                            manager = "";
                        }
                        res.json({
                            message: 'Đăng nhập thành công'
                        });
                        // if (req.session.role == "admin") {
                        //     productModels.find({}).limit(9).then((data) => {
                        //         res.json({
                        //             // productData: data.map((s) => s.toJSON()),
                        //             emailCheck: req.body.email,
                        //             loginCheck: true,
                        //             Manager: true
                        //         });
                        //     });
                        // } else if (req.session.role == "client") {
                        //     productModels.find({}).limit(9).then((data) => {
                        //         res.json({
                        //             // productData: data.map((s) => s.toJSON()),
                        //             emailCheck: req.body.email,
                        //             loginCheck: true,
                        //         });
                        //     });
                        // }
                    } else {
                        console.log(check.password + "|" + req.body.password);
                        res.send("Wrong password");
                        console.log(`Wrong password`.bgRed.white.strikethrough.bold);
                    }
                } else {
                    console.log("Password null".bgRed.white.strikethrough.bold);
                }
            } else {
                res.send("Wrong Email");
                console.log("Wrong Email".bgRed.white.strikethrough.bold);
                // console.log(req.body);
            }
        });
    } catch (err) {
        console.log("Failed: ".bgRed.white.strikethrough.bold, err);
    }
})
router.get('/logout', (req, res) => {
    // destroy session data
    // req.session.loggedin = false;
    req.session.destroy();
    fs.writeFile('private.txt', "", err => {
        if (err) throw err;
    });
    // redirect to homepage
    console.log(`⚠️  Đăng xuất thành công`.yellow);
    res.send({
        message: 'Đăng xuất thành công'
    })
})
//Gọi danh sách người dùng
router.get('/list', async (req, res) => {
    try {
        const user = await userModels.find({});
        res.status(200).json(user);
        console.log(`✅ Get list user Success`.green.bold);
    } catch (error) {
        console.log(`❗  ${error.message}`.bgRed.white.strikethrough.bold);
        res.status(500).json({
            message: error.message
        })
    }
})
//Gọi chi tiết người dùng
router.get('/detail/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const user = await userModels.findById(id);
        res.status(200).json(user);
        console.log(`✅ Gọi chi tiết người dùng thành công`.green.bold);
    } catch (error) {
        console.log(`❗  ${error.message}`.bgRed.white.strikethrough.bold);
        res.status(500).json({
            message: error.message
        })
        console.log(`❗  Gọi chi tiết người dùng thất bại`.bgRed.white.strikethrough.bold);
    }
})
//Cập nhập người  dùng
router.put('/update/:id', upload.single("image"), async (req, res) => {
    try {
        const {
            id
        } = req.params;
        let user = await userModels.findById(id);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        if (req.file != null) {
            await cloudinary.uploader.destroy(user.cloudinary_id);
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "android-networking/users"
            });
            const data = {
                name: req.body.name || user.name,
                email: req.body.email || user.email,
                password: hashedPassword || user.password,
                address: req.body.address || user.address,
                phone: req.body.phone || user.phone,
                avatar: result.secure_url || user.avatar,
                cloudinary_id: result.public_id || user.cloudinary_id,
            }
            await userModels.findByIdAndUpdate(id, data, {
                    new: true
                })
                .then(doc => {
                    res.json({
                        status: "Cập nhập người (hình ảnh) dùng thành công"
                    })
                    console.log(`✅  Cập nhập người (hình ảnh) dùng thành công`.green.bold);
                })
                .catch(err => {
                    console.log(`Lỗi catch: `.bgRed, err);
                });
        } else {
            const data = {
                name: req.body.name || user.name,
                email: req.body.email || user.email,
                password: hashedPassword || user.password,
                address: req.body.address || user.address,
                phone: req.body.phone || user.phone,
            }
            await userModels.findByIdAndUpdate(id, data)
                .then(doc => {
                    res.json({
                        status: "Cập nhập người (không hình ảnh) dùng thành công"
                    })
                    console.log(`✅  Cập nhập người (không hình ảnh) dùng thành công`.green.bold);
                })
                .catch(err => {
                    console.log(`❗  Lỗi else`.bgRed.white.strikethrough.bold);
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
//Xoá người dùng
router.delete('/delete/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const user = await userModels.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                message: `Không tìm thấy người dùng`
            })
        }
        await cloudinary.uploader.destroy(user.cloudinary_id)
        res.status(200).json(user);
        console.log(`✅ Xoá thành công`.green.bold);
    } catch (error) {
        console.log(`❗  ${error.message}`.bgRed.white.strikethrough.bold);
        res.status(500).json({
            message: error.message
        })
    }
})
module.exports = router;