const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
    user_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
    },
    description: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    favorite: {
        type: Number,
        default: 0
    },
    comments: [{
        user_ID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        user_name: {
            type: String, // Thêm trường tên người dùng
            require: true
        },
        user_avatar: {
            type: String, // Thêm trường avatar người dùng
            require: false
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    image: {
        type: String,
        require: false
    },
    cloudinary_id: {
        type: String,
        require: false
    }
}, {
    timestamps: true,
});

const post = mongoose.model('post', postSchema);

module.exports = post;