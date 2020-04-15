const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
    {
        user: String,
        content: {
            type: String,
            default: 'DEFAULT_CONTENT'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
    });

module.exports = {
    Message: mongoose.model('Message', MessageSchema),
};
