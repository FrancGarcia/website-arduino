const http = require('http');
const fs = require('fs');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const socketIo = require('socket.io');

// Read the index.html file
const index = fs.readFileSync('index.html');

// Set up the serial port with the correct configuration
const port = new SerialPort({
    path: 'COM8',
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});

// Create a parser using the ReadlineParser
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Create an HTTP server
const app = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(index);
});

// Attach Socket.io to the HTTP server
const io = socketIo(app, {
    cors: {
        origin: "*", // Allow any origin, adjust for security as needed
        methods: ["GET", "POST"]
    }
});

// Connect the client to the server
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Event handler for when data is received from the serial port
parser.on('data', (data) => {
    console.log('Received data from port:', data);
    io.emit('data', data); // Emit the data event with the data
});

// Start the server and listen on port 3000
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
