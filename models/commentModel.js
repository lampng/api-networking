const mongoose = require('mongoose');
const commentSchema = mongoose.Schema({
    post_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        require: true
    },
    user_name: {
        type: String, // Thêm trường tên người dùng
        require: true
    },
    user_avatar: {
        type: String, // Thêm trường avatar người dùng
        require: false
    },
    comment: {
        type: String,
        require: true
    },
}, {
    timestamps: true,
});

const comment = mongoose.model('comment', commentSchema);

module.exports = comment;