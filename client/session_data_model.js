import mongoose from 'mongoose';

let Schema = mongoose.Schema

export const session_data_schema = Schema({
    start_time: {
        type: Date,
        required: true
    },
    sensor_waterlevel_bawah: {
        type: Array,
        default: []
    },
    sensor_waterlevel_atas: {
        type: Array,
        default: []
    },
    sensor_raindrop: {
        type: Array,
        default: []
    }
}, {
    timestamps: true,
})

export const SessionData = mongoose.model('session_data', session_data_schema);