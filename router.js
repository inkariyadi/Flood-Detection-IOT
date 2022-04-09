import express from 'express';
import * as MQTTClient from './src/mqtt_client.js';

const router = express.Router();

router.get('/hello', MQTTClient.HelloWorld);

export default router;