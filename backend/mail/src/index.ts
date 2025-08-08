import express from 'express';
import dotenv from 'dotenv';

dotenv.config()

const app = express();

app.listen(process.env.PORT, ()=>{
    console.log(`Mail server is running on port ${process.env.PORT}`)
})