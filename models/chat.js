const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

const chatSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [messageSchema],
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema); 