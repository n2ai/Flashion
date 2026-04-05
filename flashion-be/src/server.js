// import express
const express = require('express');
// import cors
const cors = require('cors');
// import dotenv
require('dotenv').config();

const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// logging middleware
app.use((req, res, next)=>{
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
})

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/outfits', require('./routes/outfits'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/quick-scan', require('./routes/quickScan'));
app.use('/api/generate-outfits', require('./routes/generateOutfits'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/change-password', require('./routes/changePassword'));

// health checks
app.get('/api/health', (req, res)=>{
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error handling 
app.use((err, req, res, next)=>{
    console.log(err.stack);
    res.status(404).json({error: `Route not found: ${req.method} ${req.url} not found`});
});

// global error handling
app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(err.status || 500).json({error: `${err.message || 'Internal Server Error'}`});
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
})

module.exports = app;