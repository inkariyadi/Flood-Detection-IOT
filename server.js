import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import router from './router.js';

dotenv.config();

const app = express();
app.use(express.json())

app.use('/api', router);

const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.ATLAS_URI || "";

try{
    mongoose.connect(CONNECTION_URL, {
        serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    });
    
    mongoose.connection.once('open', () => {
        console.log("MongoDB database connection established successfully");
    })

    app.listen(PORT, () => {
        console.log(`Server is running on PORT: ${PORT}`)
    })

} catch (err) {
    console.log("Error: " + err.message);
}