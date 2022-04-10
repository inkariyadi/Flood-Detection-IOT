import mqtt from 'mqtt';
import { SensorData } from './sensor_data_model.js';
import { SessionData } from './session_data_model.js';

// Client Config
const host = '202.148.1.57'
const port = '1883'
const connectUrl = `mqtt://${host}:${port}`
const clientId = "subscriber-nodejs";
const username = 'app-Esp32ElectricalFloodSafetySystem'
const password = '0r2p9o9ttu7YpwLYiKXwJIb9SLjwKF'

const client  = mqtt.connect(connectUrl, {
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
let sessionStart = false;
let sessionId;
let resetSession;

const sessionTimer = () => {
    console.log("Timer mulai");
    resetSession = setTimeout(
        () => {
          console.log("End of session");
          sessionStart = false;
          sessionId = null;

          // Unsubscribe to sensor topics except the main sensor
          client.unsubscribe('alertActuatorEFSS');
          client.unsubscribe('waterHeightAlertEFSS');
          client.unsubscribe('raindropSensorEFSS');

      }, 100000)
}

/*********************  MAIN FUNCTIONS OF CLIENT **********************/
client.on('connect', () => {
    console.log("Connected to MQTT Broker");
    
    // When receiving message
    client.on('message', (topic, message, packet) => {
        // Session Start
        if((topic == 'waterHeightDetectorEFSS') && (!sessionStart)){
            console.log("Initiate Session");
            sessionTimer()

            let session = new SessionData({
                start_time: new Date().toISOString()
            })

            console.log(session);
            // Subscribe to another sensor topics
            client.subscribe('alertActuatorEFSS');
            client.subscribe('waterHeightAlertEFSS');
            client.subscribe('raindropSensorEFSS');

            session.save();

            // TODO: Create MongoDB Session Instance
            sessionId = session.start_time;
            sessionStart = true;
        }

        // Receive Data
        if(sessionStart) {
            console.log("Receive Data");

            if(topic == "waterHeightDetectorEFSS"){
                clearTimeout(resetSession);
                sessionTimer();
            }
            collectSessionData(topic, message, packet, sessionId);
        }
    })

})

const collectSessionData = (topic, message, packet, sessionId) => {
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

    console.log('Received Session Id:', sessionId);
    console.log('Sensor Data', sensor_data);
    
    if(topic == "waterHeightDetectorEFSS"){
        SessionData.findOneAndUpdate(
            {start_time: sessionId}, {$push: {sensor_waterlevel_bawah: sensor_data}}, {new: true}
        ).then((result) => {
            console.log(result);
        });
    } else if(topic == "waterHeightAlertEFSS"){
        SessionData.findOneAndUpdate(
            {start_time: sessionId}, {$push: {sensor_waterlevel_atas: sensor_data}}, {new: true}
        ).then((result) => {
            console.log(result);
        });
    } else if (topic == "raindropSensorEFSS"){
        SessionData.findOneAndUpdate(
            {start_time: sessionId}, {$push: {sensor_raindrop: sensor_data}}, {new: true}
        ).then((result) => {
            console.log(result);
        });
    }
}

export const HelloWorld = async (req, res) => {
    return res.status(200).send("Hello from MQTT Receiver");
}