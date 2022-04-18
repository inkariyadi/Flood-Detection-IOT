import React, {useState, useEffect} from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import WaterIcon from '@mui/icons-material/Water';
import CloudIcon from '@mui/icons-material/Cloud';
import Button from '@mui/material/Button';
import axios from 'axios';
import moment from 'moment';
import "./charts.css";

const preprocessSensorData = (data) => {
  return data.map((value)=> ({
    time: moment(value.timestamp).format("hh:mm:ss"),
    amount: value.data,
  }))
}

const Chart = () => {
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [upperLevelData, setUpperLevelData] = useState();
  const [lowerLevelData, setLowerLevelData] = useState();
  const [raindropData, setRaindropData] = useState();
  
  const fetchData = () => {
    axios.get(`http://localhost:5000/api/getdata?picked_date=${moment(date).format("DD/MM/yy")}&start_time=${moment(startTime).format("hh:mm")}&end_time=${moment(endTime).format("hh:mm")}`)
      .then(res => {
        const sensors = res.data;
        const upperlevel = sensors["sensor_waterlevel_atas"];
        const raindrop = sensors["sensor_raindrop"];
        const lowerlevel = sensors["sensor_waterlevel_bawah"];
        setUpperLevelData(preprocessSensorData(upperlevel));
        setRaindropData(preprocessSensorData(raindrop));
        setLowerLevelData(preprocessSensorData(lowerlevel));
      })
  }
  
  useEffect(()=> {
    fetchData();
  },[]);
  
  const handleChange = (newValue) => {
    setDate(newValue);
  };
  return (
    <>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ m: 2, p: 2, width: 600 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={5}>
            <DesktopDatePicker
                label="Date"
                inputFormat="MM/dd/yyyy"
                value={date}
                onChange={handleChange}
                renderInput={(params) => <TextField {...params} />}
            />
          </Grid>
          <Grid item xs={3}>
            <TimePicker
              label="Start Time"
              value={startTime}
              onChange={(value) => {setStartTime(value)}}
              ampm={false}
              renderInput={(params) => <TextField {...params} />}
            />
          </Grid>
          <Grid item xs={3}>
            <TimePicker
              label="End Time"
              value={endTime}
              onChange={(value) => {setEndTime(value)}}
              ampm={false}
              renderInput={(params) => <TextField {...params} />}
            />
          </Grid>
          <Grid item xs={1}>
            <Button variant="outlined" size="large" onClick={fetchData}>
                Search
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Paper className="green-box">
          <Grid container justifyContent="space-around" spacing={2}>
            <Grid item xs={4}>
              <Box display="flex" justifyContent="flex-start">
                <WaterIcon sx={{ fontSize: 80 }} />
              </Box>
            </Grid>
            <Grid item xs={8}>
              <Box display="flex" justifyContent="flex-end">
                <Typography variant="h4" component="div" gutterBottom>
                  {upperLevelData && upperLevelData.length > 0 && upperLevelData[upperLevelData.length - 1].amount} cm
                </Typography>
              </Box>
              <Box display="flex" justifyContent="flex-end">
                <Typography variant="subtitle" component="div" gutterBottom>
                  Upper Water Level
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={4}>
        <Paper className="yellow-box">
          <Grid container justifyContent="space-around" spacing={2}>
            <Grid item xs={4}>
              <Box display="flex" justifyContent="flex-start">
                <CloudIcon sx={{ fontSize: 80 }} />
              </Box>
            </Grid>
            <Grid item xs={8}>
              <Box display="flex" justifyContent="flex-end">
                <Typography variant="h4" component="div" gutterBottom>
                {raindropData && raindropData.length > 0 && raindropData[raindropData.length - 1].amount} ml/s
                </Typography>
              </Box>
              <Box display="flex" justifyContent="flex-end">
                <Typography variant="subtitle" component="div" gutterBottom>
                  Rain Drop
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={4}>
        <Paper className="blue-box">
          <Grid container justifyContent="space-around" spacing={2}>
            <Grid item xs={4}>
              <Box display="flex" justifyContent="flex-start">
                <WaterIcon sx={{ fontSize: 80 }} />
              </Box>
            </Grid>
            <Grid item xs={8}>
              <Box display="flex" justifyContent="flex-end">
                <Typography variant="h4" component="div" gutterBottom>
                {lowerLevelData && lowerLevelData.length > 0 && lowerLevelData[lowerLevelData.length - 1].amount} cm
                </Typography>
              </Box>
              <Box display="flex" justifyContent="flex-end">
                <Typography variant="subtitle" component="div" gutterBottom>
                  Lower Water Level
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
    </Grid>
    
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Typography variant="h6" component="div" gutterBottom>
          Upper Water Level
        </Typography>
        <AreaChart
          width={650}
          height={400}
          data={upperLevelData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="color1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip cursor={{ stroke: "#82ca9d", strokeWidth: 3 }} labelStyle={{ color:'black', fontWeight: 'bold'}} itemStyle={{color:'black'}}/>
          <Legend />
          <Area type="monotone" dataKey="amount" stroke="#82ca9d" fillOpacity={1} fill="url(#color1)"/>
        </AreaChart>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="h6" component="div" gutterBottom>
          Rain Drop
        </Typography>
        <AreaChart
          width={650}
          height={400}
          data={raindropData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="color2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fdfece" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#fdfece" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip cursor={{ stroke: "#fdfece", strokeWidth: 3 }} labelStyle={{ color:'black', fontWeight: 'bold'}} itemStyle={{color:'black'}} />
          <Legend />
          <Area type="monotone" dataKey="amount" stroke="#fdfece" fillOpacity={1} fill="url(#color2)" />
        </AreaChart>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="h6" component="div" gutterBottom>
          Lower Water Level
        </Typography>
        <AreaChart
          width={650}
          height={400}
          data={lowerLevelData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="color3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c3e0fa" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#c3e0fa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip cursor={{ stroke: "#c3e0fa", strokeWidth: 3 }} labelStyle={{ color:'black', fontWeight: 'bold'}} itemStyle={{color:'black'}} />
          <Legend />
          <Area type="monotone" dataKey="amount" stroke="#c3e0fa" fillOpacity={1} fill="url(#color3)" />
        </AreaChart>
      </Grid>
    </Grid>
    </>
  )
};


export default Chart;