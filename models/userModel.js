const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    role: {
        type: String,
        require: true
    },
    avatar: {
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

const user = mongoose.model('user', userSchema);

module.exports = user;