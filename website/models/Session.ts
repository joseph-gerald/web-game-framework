import mongoose from 'mongoose';

var Schema = mongoose.Schema;

const scheme = new Schema({
    display_name: {
        type: String,
        required: [true, 'Display name is required']
    },
    fingerprint_hash: {
        type: String,
        required: [true, 'Fingerprint is required']
    },
    fingerprint_data: {
        type: String,
        required: [true, 'Fingerprint is required']
    },
    ip_address: {
        type: String,
        required: [true, 'IP Address is required']
    },
}, {
    timestamps: true
})

let Session;

// cache for hot reload
try {
    Session = mongoose.model('Session');
} catch (error) {
    Session = mongoose.model('Session', scheme);
}

export default Session as any;