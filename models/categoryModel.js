const mongoose = require('mongoose');
const categorySchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
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

const cat = mongoose.model('category', categorySchema);

module.exports = cat;