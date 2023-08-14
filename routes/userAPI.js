require('colors')
// mongodb user model
const userModels = require('../models/userModel');
const postModels = require('../models/PostModel');
require('dotenv').config();
const session = require('express-session');
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
        "Gọi danh sách bài viết người dùng yêu thích (GET):": "https://phanlam-api.vercel.app/user/favorites/:user_ID",
    })
})
// TODO: Đăng ký
// TODO: Lưu ý "Key" ở trong form-data phải cùng tên với (upload.single("image"))
router.post('/register', upload.single("image"), async (req, res) => {
    try {

        const emailCheck = await userModels.findOne({
            email: req.body.email
        });
        if (emailCheck) {
            return res.status(400).json({
                message: 'Email đã tồn tại'
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
                // address: req.body.address,
                // phone: req.body.phone,
                // role: "client",
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
        }
        // =============================================

    } catch (error) {
        console.log(`ERRORR: ${error}`.bgRed.white);
    }
})
// TODO: Đăng nhập
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
                        req.session.email = check.email;
                        req.session._id = check._id
                        req.session.loggedin = true;
                        req.session.role = manager;

                        const {
                            _id,
                            loggedin
                        } = req.session
                        const getName = check.name;
                        const getEmail = check.email;
                        const getRole = check.role;
                        const getAvatar = check.avatar;
                        const getcloudinary_id = check.cloudinary_id;
                        console.log(`✅  Đăng nhập thành công`.green.bold);
                        res.json({
                            "session_id": req.session.id,
                            "_id": _id,
                            "loggedin": loggedin,
                            "name": getName,
                            "email": getEmail,
                            "role": getRole,
                            "avatar": getAvatar,
                            "cloudinary_id": getcloudinary_id,
                        });
                    } else {
                        console.log(check.password + "|" + req.body.password);
                        res.send("Sai mật khẩu");
                        console.log(`Sai mật khẩu`.bgRed.white.strikethrough.bold);
                    }
                } else {
                    console.log("Ô nhập mật khẩu đang trống".bgRed.white.strikethrough.bold);
                }
            } else {
                res.send("Sai email");
                console.log("Sai email".bgRed.white.strikethrough.bold);
                // console.log(req.body);
            }
        });
    } catch (err) {
        console.log("Đăng nhập thấy bại: ".bgRed.white.strikethrough.bold, err);
    }
})
router.get('/logout/:id', (req, res) => {
    const id = req.params.id
    req.sessionStore.destroy(id)
    console.log(`✅  Đăng xuất thành công`.green.bold);
})
// TODO: Gọi danh sách người dùng
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
// TODO: Gọi chi tiết người dùng
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
// TODO: Chỉnh sửa thông tin người dùng
router.put('/update/:id', upload.single("image"), async (req, res) => {
    try {
        const {
            id,
        } = req.params;
        let user = await userModels.findById(id);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        if (req.file != null) {
            if (user.cloudinary_id != null) {
                await cloudinary.uploader.destroy(user.cloudinary_id);
            }
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "android-networking/users"
            });
            const data = {
                name: req.body.name || user.name,
                email: req.body.email || user.email,
                password: hashedPassword || user.password,
                // address: req.body.address || user.address,
                // phone: req.body.phone || user.phone,
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
// TODO: Xoá người dùng
router.delete('/delete/:id', async (req, res) => {
    try {
        const {
            id
        } = req.params;

        // Lấy danh sách bài viết của người dùng
        const postsToDelete = await postModels.find({
            user_ID: id
        });

        // Xoá các tệp trên Cloudinary liên quan đến các bài viết
        for (const post of postsToDelete) {
            if (post.cloudinary_id) {
                await cloudinary.uploader.destroy(post.cloudinary_id);
                console.log(`✅ Đã xoá tệp trên Cloudinary: ${post.cloudinary_id}`);
            }
        }

        // Xoá các bài viết của người dùng
        await postModels.deleteMany({
            user_ID: id
        });
        // Xoá người dùng
        const user = await userModels.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                message: `Không tìm thấy người dùng`
            });
        }

        // Xoá tệp trên Cloudinary liên quan đến người dùng
        if (user.cloudinary_id) {
            await cloudinary.uploader.destroy(user.cloudinary_id);
            console.log(`✅ Đã xoá tệp trên Cloudinary của người dùng: ${user.cloudinary_id}`);
        }
        console.log(`✅ Xoá thành công`);
        res.status(200).json(user);
    } catch (error) {
        console.log(`❗  ${error.message}`.bgRed.white.strikethrough.bold);
        res.status(500).json({
            message: error.message
        })
    }
})
// TODO: gọi danh sách các bài viết yêu thích của người dùng
router.get('/favorites/:user_ID', async (req, res) => {
    try {
        const user_ID = req.params.user_ID;
        const user = await userModels.findById(user_ID);

        if (!user) {
            return res.status(404).json({
                message: 'Người dùng không tồn tại'
            });
        }

        const favoritePostIDs = user.favorite;
        const favoritePosts = await postModels.find({
            _id: {
                $in: favoritePostIDs
            }
        }).sort({
            createdAt: -1
        });

        const combinedData = await Promise.all(favoritePosts.map(async post => {
            const postUser = await userModels.findById(post.user_ID);
            return {
                user_ID: postUser._id,
                name: postUser.name,
                email: postUser.email,
                role: postUser.role,
                avatar: postUser.avatar,
                post_ID: post._id,
                description: post.description,
                date: post.date,
                favorite: post.favorite,
                image: post.image,
                cloudinary_id: post.cloudinary_id,
                comments: post.comments,
            };
        }));

        res.status(200).json(combinedData);
        console.log(`✅ Gọi danh sách bài viết yêu thích thành công`.green.bold);
    } catch (error) {
        console.log(`❗ ${error.message}`.bgRed.white.strikethrough.bold);
        res.status(500).json({
            message: 'Đã có lỗi xảy ra'
        });
    }
});

module.exports = router;