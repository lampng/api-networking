require('colors')
// mongodb user model
const postModels = require('../models/PostModel');
const userModels = require('../models/userModel');
require('dotenv').config();
//Tải lên ảnh
const cloudinary = require('../middleware/cloudinary.js');
const upload = require('../middleware/upload');
const path = require('path');
var express = require('express');
const favorite = require('../models/favorite');
var router = express.Router();
router.get('/', (req, res) => {
    res.json({
        status: "API ON",
        "Tạo bài viết(POST):": "https://phanlam-api.vercel.app/post/create",
        "Cập nhập bài viết(PUT):": "https://phanlam-api.vercel.app/post/update/:id",
        "Xoá bài viết(DELETE):": "https://phanlam-api.vercel.app/post/delete/:id",
        "Gọi danh sách bài viết(GET):": "https://phanlam-api.vercel.app/post/list",
        "Gọi chi tiết bài viết(GET):": "https://phanlam-api.vercel.app/post/detail/:id",
        "Gọi các bài viết của người dùng(GET):": "https://phanlam-api.vercel.app/post/list/:user_ID",
        "Like bài viết | cần id bài viết và id người dùng (POST):": "https://phanlam-api.vercel.app/post/like/:postID",
        "Comment bài viết:": "https://phanlam-api.vercel.app/post/comments/:postID",
    })
})
// TODO: Gọi danh sách bài viết
router.get('/list', async (req, res) => {
    try {
        const post = await postModels.find({}).sort({
            createdAt: -1
        });
        const userIDs = post.map(post => post.user_ID);


        // Truy vấn thông tin người dùng dựa trên user_ID
        const users = await userModels.find({
            _id: {
                $in: userIDs
            }
        });

        // Tạo một mảng mới chứa thông tin từ cả hai nguồn: bài viết và người dùng
        const combinedData = post.map(post => {
            const user = users.find(user => user._id.equals(post.user_ID));
            return {
                user_ID: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                post_ID: post._id,
                description: post.description,
                date: post.date,
                favorite: post.favorite,
                image: post.image,
                cloudinary_id: post.cloudinary_id,
                comments: post.comments
            };
        });

        // console.log(`❕  ${combinedData}`.cyan.bold);
        res.status(200).json(combinedData);
        console.log(`✅ Gọi danh sách bài viết thành công`.green.bold);
    } catch (error) {
        console.log(`❗  ${error.message}`.bgRed.white.strikethrough.bold);
        res.status(500).json({
            message: "Không có bài viết nào"
        })
    }
})
// TODO: xem trang cá nhân(Hiển thị các bài viết của mình)
router.get('/list/:user_ID', async (req, res) => {
    try {
        const user_ID = req.params.user_ID
        const post = await postModels.find({user_ID: user_ID}).sort({
            createdAt: -1
        });
        const userIDs = post.map(post => post.user_ID);


        // Truy vấn thông tin người dùng dựa trên user_ID
        const users = await userModels.find({
            _id: {
                $in: userIDs
            }
        });

        // Tạo một mảng mới chứa thông tin từ cả hai nguồn: bài viết và người dùng
        const combinedData = post.map(post => {
            const user = users.find(user => user._id.equals(post.user_ID));
            return {
                user_ID: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                post_ID: post._id,
                description: post.description,
                date: post.date,
                favorite: post.favorite,
                image: post.image,
                cloudinary_id: post.cloudinary_id,
                comments: post.comments
            };
        });

        // console.log(`❕  ${combinedData}`.cyan.bold);
        res.status(200).json(combinedData);
        console.log(`✅ Gọi danh sách bài viết thành công`.green.bold);
    } catch (error) {
        console.log(`❗  ${error.message}`.bgRed.white.strikethrough.bold);
        res.status(500).json({
            message: "Không có bài viết nào"
        })
    }
})
// TODO: Tạo bài viết
router.post('/create', upload.single("image"), async (req, res) => {
    try {
        const user_ID = req.body.user_ID
        if (user_ID) {
            console.log(`❕  ${user_ID}`.cyan.bold);

            if (req.file != null) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "android-networking/posts"
                });
                console.log(`❕  ${user_ID}`.cyan.bold);

                const NewPost = new postModels({
                    user_ID: user_ID,
                    description: req.body.description,
                    image: result.secure_url,
                    cloudinary_id: result.public_id,
                })
                try {
                    await NewPost.save();
                    console.log(`✅ Tạo bài viết thành công`.green.bold);
                    res.json({
                        object: NewPost
                    });
                } catch (error) {
                    console.log(`❗  ${error}`.bgRed.white.strikethrough.bold);
                }
            } else {
                const NewPost = new postModels({
                    user_ID: user_ID,
                    description: req.body.description,
                })
                try {
                    await NewPost.save();
                    console.log(`✅ Tạo bài viết thành công`.green.bold);
                    res.json({
                        object: NewPost
                    });
                } catch (error) {
                    console.log(`❗  ${error}`.bgRed.white.strikethrough.bold);
                }
            }
        } else {
            res.status(500).json({
                message: "Vui lòng đăng nhập trước khi sử dụng API này"
            })
        }

    } catch (error) {

    }
})
// TODO: Cập nhật bài viết
router.put('/update/:id', upload.single("image"), async (req, res) => {
    try {
        const post_ID = req.params.id;
        console.log("🐼 ~ file: postAPI.js:118 ~ router.put ~ post_ID:", post_ID)
        const user_ID = req.body.user_ID;

        if (user_ID) {
            const post = await postModels.findById(post_ID);

            if (!post) {
                return res.status(404).json({
                    message: "Bài viết không tồn tại"
                });
            }

            if (post.user_ID.toString() !== user_ID) {
                return res.status(403).json({
                    message: "Bạn không có quyền chỉnh sửa bài viết này"
                });
            }
            // Cập nhật mô tả nếu có
            if (req.body.description) {
                post.description = req.body.description;
            }

            // Cập nhật ảnh nếu có
            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "android-networking/posts"
                });
                if (post.cloudinary_id != null) {
                    await cloudinary.uploader.destroy(post.cloudinary_id);
                }
                console.log(`❕  Dô được đây rồi`.cyan.bold);
                post.image = result.secure_url;
                post.cloudinary_id = result.public_id;
            } else {
                try {
                    await cloudinary.uploader.destroy(post.cloudinary_id);
                    post.image = null;
                    post.cloudinary_id = null;
                    console.log("🐼 ~ file: postAPI.js:156 ~ router.put ~ post.cloudinary_id:", post.cloudinary_id)
                } catch (error) {
                    console.log(`❗  Không có ảnh để xoá`.bgRed.white.strikethrough.bold);
                }
            }

            // Lưu cập nhật vào cơ sở dữ liệu
            await post.save();

            console.log(`✅ Cập nhật bài viết thành công`.green.bold);
            res.json({
                message: "Cập nhật bài viết thành công",
                updatedPost: post
            });
        } else {
            res.status(500).json({
                message: "Vui lòng đăng nhập trước khi sử dụng API này"
            });
        }
    } catch (error) {
        console.log(`❗  ${error.message}`.bgRed.white.strikethrough.bold);
        console.log("🐼 ~ file: postAPI.js:180 ~ res.status ~ Đã xảy ra lỗi khi cập nhật bài viết:")
        res.status(500).json({
            message: "Đã xảy ra lỗi khi cập nhật bài viết"
        });
    }
})
// TODO: Xoá bài viết
router.delete('/delete/:id', async (req, res) => {
    const {
        id
    } = req.params;
    const post = await postModels.findByIdAndDelete(id);
    if (!post) {
        return res.status(404).json({
            message: `Không tìm thấy bài viết`
        });
    }
    // Xoá tệp trên Cloudinary liên quan đến bài viết
    if (post.cloudinary_id) {
        await cloudinary.uploader.destroy(post.cloudinary_id);
        console.log(`✅ Đã xoá tệp trên Cloudinary của bài viết: ${post.cloudinary_id}`);
    }
    // Xoá ID bài viết trong trường favorite của người dùng
    const users = await userModels.find({ // Tìm những người dùng có id bài viết này trong favorite
        favorite: id
    });
    console.log("🐼 ~ file: postAPI.js:209 ~ router.delete ~ users:", users)
    for (const user of users) {
        const index = user.favorite.indexOf(id);
        if (index !== -1) {
            user.favorite.splice(index, 1); // Xoá ID bài viết trong mảng favorite
            await user.save(); // Lưu lại thông tin người dùng
        }
    }
})
// TODO: like
router.post('/like/:postID', async (req, res) => {
    try {
        const postID = req.params.postID;
        const userID = req.body.user_ID;

        // Tìm bài viết cần like
        const post = await postModels.findById(postID);

        if (!post) {
            return res.status(404).json({
                message: 'Bài viết không tồn tại.'
            });
        }

        // Kiểm tra xem người dùng đã like bài viết chưa
        const user = await userModels.findById(userID);
        if (!user) {
            return res.status(404).json({
                message: 'Người dùng không tồn tại.'
            });
        }

        // Kiểm tra xem người dùng đã like bài viết hay chưa
        const alreadyLiked = user.favorite.includes(postID);

        if (alreadyLiked) {
            // Người dùng đã like bài viết, nên giảm số lượt like và xoá bản ghi favorite
            post.favorite -= 1;
            user.favorite.pull(postID);
            await favorite.findOneAndDelete({
                post_ID: postID
            }); // Tên model favorite và trường user_ID cần được điều chỉnh
        } else {
            // Người dùng chưa like bài viết, tăng số lượt like và thêm bản ghi favorite
            post.favorite += 1;
            user.favorite.push(postID);
            // const newFavorite = new favorite({ post_ID: postID, user_ID: userID }); // Tên model favorite và trường user_ID cần được điều chỉnh
            const newFavorite = new favorite({
                post_ID: postID
            }); // Tên model favorite và trường user_ID cần được điều chỉnh
            await newFavorite.save();
        }

        await post.save();
        await user.save();

        res.json({
            favorite: post.favorite
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Có lỗi xảy ra.'
        });
    }
});
// TODO: bình luận
router.post('/comments/:postID', async (req, res) => {
    const postID = req.params.postID;
    const userID = req.body.user_ID;
    const content = req.body.content;

    try {
        const post = await postModels.findById(postID);
        if (!post) {
            return res.status(404).json({ error: 'Bài viết không tồn tại' });
        }
        const user = await userModels.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }
        const comment = {
            user_ID: userID,
            user_name: user.name, // Thêm tên người dùng
            user_avatar: user.avatar, // Thêm avatar người dùng
            content: content
        };
        console.log(`❕  ${user.avatar}`.cyan.bold);
        console.log(`✅  bình luận thành công`.green.bold);
        post.comments.push(comment);
        await post.save();
        console.log(`✅  ${post}`.green.bold);
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
});

module.exports = router;