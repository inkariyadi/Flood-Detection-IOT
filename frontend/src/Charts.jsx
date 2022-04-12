import React, {useState} from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import WaterIcon from '@mui/icons-material/Water';
import CloudIcon from '@mui/icons-material/Cloud';
import "./charts.css";


const data = [
  {
    name: 'Page A',
    upperWaterLevel: 4000,
    amt: 2400,
  },
  {
    name: 'Page B',
    upperWaterLevel: 3000,
    amt: 2210,
  },
  {
    name: 'Page C',
    upperWaterLevel: 2000,
    amt: 2290,
  },
  {
    name: 'Page D',
    upperWaterLevel: 2780,
    amt: 2000,
  },
  {
    name: 'Page E',
    upperWaterLevel: 1890,
    amt: 2181,
  },
  {
    name: 'Page F',
    upperWaterLevel: 2390,
    amt: 2500,
  },
  {
    name: 'Page G',
    upperWaterLevel: 3490,
    amt: 2100,
  },
];

const Chart = () => {
  const [value, setValue] = useState(new Date());

  const handleChange = (newValue) => {
    setValue(newValue);
  };
  return (
    <>
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ m: 2, p: 2, width: 600 }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <DesktopDatePicker
                label="Date"
                inputFormat="MM/DD/yyyy"
                value={value}
                onChange={handleChange}
                renderInput={(params) => <TextField {...params} />}
            />
          </Grid>
          <Grid item xs={4}>
            <TimePicker
              label="Start Time"
              value={value}
              onChange={handleChange}
              ampm={false}
              renderInput={(params) => <TextField {...params} />}
            />
          </Grid>
          <Grid item xs={4}>
            <TimePicker
              label="End Time"
              value={value}
              onChange={handleChange}
              ampm={false}
              renderInput={(params) => <TextField {...params} />}
            />
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
                  1 cm
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
                  3 ml/s
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
                  1 cm
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
          data={data}
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
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip cursor={{ stroke: "#82ca9d", strokeWidth: 3 }} labelStyle={{ color:'black', fontWeight: 'bold'}} itemStyle={{color:'black'}}/>
          <Legend />
          <Area type="monotone" dataKey="upperWaterLevel" stroke="#82ca9d" fillOpacity={1} fill="url(#color1)"/>
        </AreaChart>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="h6" component="div" gutterBottom>
          Rain Drop
        </Typography>
        <AreaChart
          width={650}
          height={400}
          data={data}
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
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip cursor={{ stroke: "#fdfece", strokeWidth: 3 }} labelStyle={{ color:'black', fontWeight: 'bold'}} itemStyle={{color:'black'}} />
          <Legend />
          <Area type="monotone" dataKey="upperWaterLevel" stroke="#fdfece" fillOpacity={1} fill="url(#color2)" />
        </AreaChart>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="h6" component="div" gutterBottom>
          Lower Water Level
        </Typography>
        <AreaChart
          width={650}
          height={400}
          data={data}
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
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip cursor={{ stroke: "#c3e0fa", strokeWidth: 3 }} labelStyle={{ color:'black', fontWeight: 'bold'}} itemStyle={{color:'black'}} />
          <Legend />
          <Area type="monotone" dataKey="upperWaterLevel" stroke="#c3e0fa" fillOpacity={1} fill="url(#color3)" />
        </AreaChart>
      </Grid>
    </Grid>
    </>
  )
};


export default Chart;