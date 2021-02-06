
const http = require('http');
const DEVICE_TYPE_CAMERA = 'Camera';
const DEVICE_TYPE_LIGHT = 'Light';
const TURN_ON = 'Turn On';
const SHOW = 'Show';

function showCamera(which_camera) {
	console.log(` ${which_camera} camera would be streamed`);

	const command = getPassthruCommand(which_camera,DEVICE_TYPE_CAMERA,SHOW);
	commandPassthruAssistant(command);

}

function changeLightState(device_name, state) {
	console.log(` ${device_name} ${state} `);

	const command = getPassthruCommand(device_name,DEVICE_TYPE_LIGHT,state);
	commandPassthruAssistant(command);


}

function commandPassthruAssistant(assistant_request) {

	//console.log(`assistant_request..: ${assistant_request}`)
	console.info(`Assistant Passthru Command Executing..:${assistant_request}`);
	const options = {
		hostname: 'localhost',
		port: 5000,
		path: '/assistant/passthru/command',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': assistant_request.length
		}
	}

	const req = http.request(options, res => {
		console.log(`statusCode: ${res.statusCode}`)

		res.on('data', d => {
			process.stdout.write(d)
		})
	})

	req.on('error', error => {
		console.error(error)
	})

	req.write(assistant_request)
	req.end()

	console.info(`Assistant Passthru Command Executed`);

}


function getPassthruCommand(device_name, device_type, action) {

	

	var command_request = `{
		  "device_name": "${device_name}",
		  "action": "${action}",
		  "device_type": "${device_type}" 
	  }`;

	return command_request;

}

module.exports = { showCamera, changeLightState };
