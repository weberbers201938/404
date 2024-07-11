const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');


const configPath = path.join(__dirname, '../../config.json');
const config = JSON.parse(fs.readFileSync(configPath));

const username = config.username;
const key = config.key;

async function runScript() {
    try {
        const response = await axios.post('https://syntic-77bw.onrender.com/verify-key', { username, key });
        if (response.data === 'Key is valid') {
            console.log('Key is valid. Running Python script...');

            // Tawagin ang terminal commands para sa installation ng Python at mga packages
            exec('python --version', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error checking Python installation: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Python stderr: ${stderr}`);
                    return;
                }
                console.log(`Python stdout: ${stdout}`);

                // Kung wala pang Python, install ito
                if (!stdout.includes('Python')) {
                    console.log('Python is not installed. Installing Python...');
                    exec('sudo apt-get update && sudo apt-get install python3', (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error installing Python: ${error.message}`);
                            return;
                        }
                        console.log(`Python installation successful.`);
                        // Install ng Python packages kung matapos ang Python installation
                        installPythonPackages();
                    });
                } else {
                    console.log('Python is already installed.');
                    // Install ng Python packages kung naka-install na ang Python
                    installPythonPackages();
                }
            });
        } else {
            console.log('Invalid key or key not approved. Request a key at https://syntic-77bw.onrender.com/');
        }
    } catch (error) {
        console.error('Error verifying key:', error.response ? error.response.data : error.message);
    }
}

function installPythonPackages() {
    console.log('Installing Python packages...');
    exec('pip install requests numpy pandas', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error installing Python packages: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Python packages stderr: ${stderr}`);
            return;
        }
        console.log(`Python packages installation successful.`);
        // Tumawag ng Python script pagkatapos ng installation ng packages
        runPythonScript();
    });
}

function runPythonScript() {
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
}

runScript();
