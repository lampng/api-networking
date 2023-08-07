const mongoose = require('mongoose');
const orderSchema = mongoose.Schema({
    customer_ID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    price_total: {
        type: Number,
        require: true
    },
    date_order: {
        type: Date,
        default: Date.now()
    },
    order_status: {
        type: String,
        require: true
    },
}, {
    timestamps: true,
});

const order = mongoose.model('order', orderSchema);

module.exports = order;