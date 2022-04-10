import express from 'express';
import * as MQTTClient from './client/mqtt_client.js';

const router = express.Router();

router.get('/hello', MQTTClient.HelloWorld);

export default router;