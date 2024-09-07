const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8000;
const code = require('./pair');

// Set the maximum number of listeners to 500 (optional)
require('events').EventEmitter.defaultMaxListeners = 500;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use('/code', code);
app.use('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html'));
});
app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`YouTube: https://www.youtube.com/@KermHackTools-s9s\nTelegram: t.me/rnbvb_e\nGitHub: https://github.com/Kgtech-cmr\n\nServer running on http://localhost:${PORT}`);
});

module.exports = app;
