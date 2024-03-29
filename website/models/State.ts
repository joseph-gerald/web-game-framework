import mongoose from 'mongoose';

var Schema = mongoose.Schema;

const scheme = new Schema({
    room_id: {
        type: Schema.Types.ObjectId,
        required: [true, 'Room ID is required']
    },
    players: {
        type: Array,
        required: [true, 'Players is required']
    },
    state: {
        type: Object,
        required: [true, 'State is required']
    },
    records: {
        type: Array,
        required: [true, 'Records is required']
    },
}, {
    timestamps: true
})

let State;

// cache for hot reload
try {
    State = mongoose.model('State');
} catch (error) {
    State = mongoose.model('State', scheme);
}

export default {
    Schema: scheme,
    Model: State
};