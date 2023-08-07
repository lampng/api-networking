const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    cat_ID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        require: true
    }],
    name: {
        type: String,
        require: true
    },
    des: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    imageProduct: {
        type: String,
        require: true
    },
    cloudinary_id: {
        type: String,
        require: true
    },
    sumQuantity: {
        type: Number,
        require: false
    }
}, {timestamps: true,});

const product = mongoose.model('product', productSchema);

module.exports = product;