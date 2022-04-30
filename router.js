import express from 'express';
import * as MQTTClient from './client/mqtt_client.js';
import * as DashboardData from './api/dashboard_data.js';

const router = express.Router();

router.get('/hello', MQTTClient.HelloWorld);
router.get('/getdata', DashboardData.GetDashboardData);
router.get('/livedata', DashboardData.GetRealTimeData);

export default router;