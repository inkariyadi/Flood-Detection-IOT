import { client, SENSOR_TIMEOUT, sessionStart } from "../client/mqtt_client.js";
import { SessionData } from "../client/session_data_model.js";
import { SensorData } from '../client/sensor_data_model.js';

const ParseStartEndEarliestDate = (picked_date, start_time, end_time) => {
    const [date, month, year] = picked_date.split("/")
    const [start_hour, start_minute] = start_time.split(":")
    const [end_hour, end_minute] = end_time.split(":") 

    const start_date = new Date(year, month - 1, date, start_hour, start_minute, 0).toISOString()
    const end_date = new Date(year, month - 1, date, end_hour, end_minute, 59).toISOString()
    const earliest_date = new Date( new Date(start_date) - 1000 * 60 * 30)

    return { start_date, end_date, earliest_date }
}

// Live Data
export let live_sensor_waterlevel_bawah = []
export let live_sensor_waterlevel_atas = []
export let live_sensor_raindrop = []

let resetSensorTimer;

const sensorTimer = () => {
    resetSensorTimer = setTimeout(resetLiveSession, SENSOR_TIMEOUT)
}

const resetLiveSession = () => {
    console.log("End Live Session")
    for (var i = 0; i < 10; i++) {
        setTimeout(() => {
            if(live_sensor_waterlevel_bawah) live_sensor_waterlevel_bawah.shift()
            if(live_sensor_waterlevel_atas) live_sensor_waterlevel_atas.shift()
            if(live_sensor_raindrop) live_sensor_raindrop.shift()
        }, 3000 * i);
    }
}

const insert_live_data = (array, data) => {
    if(array.length == 10){
        array.shift()
    }

    array.push(data)
}

export const GetRealTimeData = async(req, res) => {
    if(!sessionStart){
        return res.status(200).send({
            "message": "There are no live session"
        })
    } else {
        console.log("Live session started");

        client.on('message', (topic, message, packet) => {
            if(topic == "waterHeightDetectorEFSS"){
                clearTimeout(resetSensorTimer);
                sensorTimer();
            }

            let json_data = JSON.parse(message.toString());
            let data = {
                "waterHeightDetectorEFSS": json_data.water_level,
                "waterHeightAlertEFSS": json_data.water_level,
                "raindropSensorEFSS": json_data.rain_intensity
                // TODO: Define for alertActuatorEFSS
            }

            let sensor_data = new SensorData({
                timestamp: new Date().toISOString(),
                data: data[topic]
            })

            // Insert Data
            if (topic == "waterHeightDetectorEFSS") insert_live_data(live_sensor_waterlevel_bawah, sensor_data)        
            else if (topic == "waterHeightAlertEFSS") insert_live_data(live_sensor_waterlevel_atas, sensor_data)
            else if (topic == "raindropSensorEFSS") insert_live_data(live_sensor_raindrop, sensor_data)
        })

        return res.status(200).send("Successfully connected to live session")
    }
    // client.on('message', (topic, message, packet) => {

    // })
}
export const GetDashboardData = async (req, res) => {
    const { picked_date, start_time, end_time } = req.query

    // Date Parsing from Request
    const { start_date, end_date, earliest_date } = ParseStartEndEarliestDate(picked_date, start_time, end_time);

    // Query and Filter the Data Needed
    let aggregate = await SessionData.aggregate().match({ // Filter data from possibly earliest date (30 minutes before the start time)
        start_time: { 
            $gte: new Date(earliest_date),
            $lte: new Date(end_date)
        }
    }).project({ // Filter timestamp based on start time and end time
        start_time: 1,
        createdAt: 1,
        updatedAt: 1,
        sensor_waterlevel_bawah: {
            $filter: {
            input: "$sensor_waterlevel_bawah",
            as: "index",
            cond: {
                $and: [
                    { $gte: [ "$$index.timestamp", new Date(start_date) ] },
                    { $lte: [ "$$index.timestamp", new Date(end_date) ] }
                ]
            }
            }
        },
        sensor_waterlevel_atas: {
            $filter: {
            input: "$sensor_waterlevel_atas",
            as: "index",
            cond: {
                $and: [
                    { $gte: [ "$$index.timestamp", new Date(start_date) ] },
                    { $lte: [ "$$index.timestamp", new Date(end_date) ] }
                ]
            }
            }
        },
        sensor_raindrop: {
            $filter: {
            input: "$sensor_raindrop",
            as: "index",
            cond: {
                $and: [
                    { $gte: [ "$$index.timestamp", new Date(start_date) ] },
                    { $lte: [ "$$index.timestamp", new Date(end_date) ] }
                ]
            }
            }
        }
    })

    // Delete instances which have no data at all
    for (let i = aggregate.length - 1; i >= 0; i--) {
        if (!aggregate[i].sensor_waterlevel_atas.length && !aggregate[i].sensor_waterlevel_bawah.length && !aggregate[i].sensor_raindrop.length) {
          aggregate.splice(i, 1);
        }
    }

    // Organized the array to send data in a structured way
    let data_sensor_waterlevel_bawah = []
    let data_sensor_waterlevel_atas = []
    let data_sensor_raindrop = []

    aggregate.forEach((elmt) => {
        elmt.sensor_waterlevel_bawah.forEach((data) => {
            data_sensor_waterlevel_bawah.push(data)
        })

        elmt.sensor_waterlevel_atas.forEach((data) => {
            data_sensor_waterlevel_atas.push(data)
        })

        elmt.sensor_raindrop.forEach((data) => {
            data_sensor_raindrop.push(data)
        })
    })

    return res.status(200).send({ 
        sensor_waterlevel_atas: data_sensor_waterlevel_atas, 
        sensor_waterlevel_bawah: data_sensor_waterlevel_bawah,
        sensor_raindrop: data_sensor_raindrop 
    })
}