import mongoose from 'mongoose';

var Schema = mongoose.Schema;

const scheme = new Schema({
    room_id: {
        type: Schema.Types.ObjectId,
        required: [true, 'Room ID is required']
    },
    room_host: {
        type: Object,
        required: [true, 'Room Host is required']
    },
    state: {
        type: Object,
        required: [true, 'State is required']
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