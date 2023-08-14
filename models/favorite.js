const mongoose = require('mongoose');
const favoriteSchema = mongoose.Schema({
    post_ID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        require: true
    },
}, {
    timestamps: true,
});

const favorite = mongoose.model('favorite', favoriteSchema);

module.exports = favorite;