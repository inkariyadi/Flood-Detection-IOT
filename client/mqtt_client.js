import mqtt from 'mqtt';
import { SensorData } from './sensor_data_model.js';
import { SessionData } from './session_data_model.js';

export const SENSOR_TIMEOUT = 60000;

// Client Config
const host = '202.148.1.57'
const port = '1883'
const connectUrl = `mqtt://${host}:${port}`
const clientId = "subscriber-nodejs";
const username = 'app-Esp32ElectricalFloodSafetySystem'
const password = '0r2p9o9ttu7YpwLYiKXwJIb9SLjwKF'

export const client  = mqtt.connect(connectUrl, {
    clientId,
    connectTimeout: 4000,
    username: username,
    password: password,
    reconnectPeriod: 1000,
});

client.subscribe('waterHeightDetectorEFSS', () => {
    console.log('Connected to bottom water level sensor')
});

// Session Config
export let sessionStart = false;
let sessionId;
let resetSensorTimer;

// Master Sensor Detection Timer
const sensorTimer = () => {
    console.log("Start sensor timer");
    resetSensorTimer = setTimeout(resetSessionVariables, SENSOR_TIMEOUT)
}

const resetSessionVariables = () => {
    console.log("End of session");
    sessionStart = false;
    sessionId = null;

    // Unsubscribe to sensor topics except the main sensor
    client.unsubscribe('alertActuatorEFSS');
    client.unsubscribe('waterHeightAlertEFSS');
    client.unsubscribe('raindropSensorEFSS');

    clearTimeout(resetSensorTimer);
}

/*********************  MAIN FUNCTIONS OF CLIENT **********************/
client.on('connect', () => {
    console.log("Connected to MQTT Broker");
    
    // When receiving message
    client.on('message', (topic, message, packet) => {
        // Session Start
        if((topic == 'waterHeightDetectorEFSS') && (!sessionStart)){
            console.log("Initiate Session");
            sensorTimer()

            let session = new SessionData({
                start_time: new Date().toISOString()
            })

            console.log(session);
            // Subscribe to another sensor topics
            client.subscribe('alertActuatorEFSS');
            client.subscribe('waterHeightAlertEFSS');
            client.subscribe('raindropSensorEFSS');

            session.save();

            sessionId = session.start_time;
            sessionStart = true;
        }

        // Receive Data
        if(sessionStart) {
            console.log("Receive Data from ", topic, "with data", JSON.parse(message.toString()));

            if(topic == "waterHeightDetectorEFSS"){
                clearTimeout(resetSensorTimer);
                sensorTimer();
            }
            collectSessionData(topic, message, packet, sessionId);
        }
    })

})

const collectSessionData = async (topic, message, packet, sessionId) => {
    let json_data = JSON.parse(message.toString());

    let data = {
        "waterHeightDetectorEFSS": json_data.water_level,
        "waterHeightAlertEFSS": json_data.water_level,
        "raindropSensorEFSS": json_data.rain_intensity
    }

    let sensor_data = new SensorData({
        timestamp: new Date().toISOString(),
        data: data[topic]
    })
    
    let updated_session;

    if(topic == "waterHeightDetectorEFSS"){
        updated_session = await SessionData.findOneAndUpdate(
            {start_time: sessionId}, {$push: {sensor_waterlevel_bawah: sensor_data}}, {new: true}
        )
    } else if(topic == "waterHeightAlertEFSS"){
        updated_session = await SessionData.findOneAndUpdate(
            {start_time: sessionId}, {$push: {sensor_waterlevel_atas: sensor_data}}, {new: true}
        )
    } else if (topic == "raindropSensorEFSS"){
        updated_session = await SessionData.findOneAndUpdate(
            {start_time: sessionId}, {$push: {sensor_raindrop: sensor_data}}, {new: true}
        )
    }

}

export const HelloWorld = async (req, res) => {
    return res.status(200).send("Hello from MQTT Receiver");
}