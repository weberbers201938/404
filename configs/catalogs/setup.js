const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const configPath = path.join(__dirname, '../../config.json');
const config = JSON.parse(fs.readFileSync(configPath));

const username = config.username;
const key = config.key;

async function runScript() {
    try {
        // Your script logic here
        console.log('Running Python script...');
        exec(`python ${__dirname}/../../start.py`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Python script stderr: ${stderr}`);
                return;
            }
            console.log(`Python script stdout: ${stdout}`);
        });
    } catch (error) {
        console.error('Error running script:', error);
    }
}

function keepAlive() {
    // Generate a random byte array to keep the CPU busy
    crypto.randomBytes(1024, (err, buf) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Keeping alive...');

            // Perform some disk I/O to keep the Repl busy
            fs.readdir(__dirname, (err, files) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(`Files in directory: ${files.length}`);
                }
            });

            // Perform some network I/O to keep the Repl busy
            const req = require('https').request({
                method: 'GET',
                hostname: 'localhost',
                path: '/',
                headers: {
                    'User-Agent': 'Repl Uptime Keeper'
                }
            }, (res) => {
                res.on('data', (chunk) => {
                    console.log(`Received data: ${chunk.length} bytes`);
                });
            });

            req.on('error', (err) => {
                console.error(err);
            });

            req.end();

            // Schedule the next keepAlive call
            setTimeout(keepAlive, 300000); // 5 minutes
        }
    });
}

runScript();
keepAlive();
