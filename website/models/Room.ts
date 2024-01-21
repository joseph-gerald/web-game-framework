import mongoose from 'mongoose';

var Schema = mongoose.Schema;

const scheme = new Schema({
    code: {
        type: String,
        required: [true, 'Name is required']
    },
    status: {
        type: String,
        required: [true, 'Status is required']
    },
    host: {
        type: String,
        required: [true, 'Host is required']
    },
    max_players: {
        type: Number,
    },
    node_id: {
        type: String,
    },
    node_uri: {
        type: String,
    },
    node_name: {
        type: String,
    },
    name: {
        type: String,
    },
    players: {
        type: Array,
    },
}, {
    timestamps: true
})

let Room;

// cache for hot reload
try {
    Room = mongoose.model('Room');
} catch (error) {
    Room = mongoose.model('Room', scheme);
}

export default Room as any;