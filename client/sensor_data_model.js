import mongoose from 'mongoose';

let Schema = mongoose.Schema

// Coordinate
export const sensor_data_schema = new Schema({
	timestamp: {
		type: Date,
		required: true,
	},
	data: {
		type: Number,
		required: true,
	}
});

export const SensorData = mongoose.model('sensor_data', sensor_data_schema);