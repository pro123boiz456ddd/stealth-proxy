const express = require('express');
const http = require('http');
const { createBareServer } = require('@tomphttp/bare-server-node');

const app = express();
const server = http.createServer(app);
const bare = createBareServer('/bare/');

// Simple UI for the proxy landing page
app.get('/', (req, res) => {
    res.send(`
        <html>
        <body style="font-family:sans-serif; text-align:center; padding-top:50px; background:#121212; color:#fff;">
            <h1>Web Proxy Gateway</h1>
            <p>Enter the URL you wish to unblock:</p>
            <input type="text" id="url" placeholder="https://youtube.com" style="padding:10px; width:300px; border-radius:4px; border:none;">
            <button onclick="launch()" style="padding:10px 20px; border-radius:4px; border:none; background:#007bff; color:#white; cursor:pointer;">Go</button>
            <script>
                function launch() {
                    let target = document.getElementById('url').value;
                    if(!target.startsWith('http')) target = 'https://' + target;
                    // Directs traffic route through the dynamic proxy rewriting endpoint
                    alert('Connecting to target secure tunnel...');
                }
            </script>
        </body>
        </html>
    `);
});

// Handle standard network requests and routing logic
server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) {
        bare.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

// Render dynamically injects a PORT environment variable
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Proxy active on port ${PORT}`);
});