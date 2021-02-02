
const http = require('http');


function showCamera(which_camera) {
	console.log(` ${which_camera} camera would be streamed`);

	const command  = `{
		"command": " Show ${which_camera} camera on Hub",
		"converse": false,
		"user": "techsudhagar@gmail.com" 
		}`;


	commandAssistant(command);

}

function turnLightState(state) {
	console.log(` Turning light state to ${state}.`);

	const command  = `{
		"command": "Turn ${state} tube light",
		"converse": false,
		"user": "techsudhagar@gmail.com" 
		}`;


	commandAssistant(command);

}

function changeLightState(device_name,state) {
	console.log(` Turning ${device_name} to ${state}.`);

	const command  = `{
		"command": "Turn ${state} ${device_name}",
		"converse": false,
		"user": "techsudhagar@gmail.com" 
		}`;


	commandAssistant(command);

}


function notifyAssistant(event_title,diff_mins){
	console.log(`Event Title..:${event_title},..:${diff_mins}:`);

				console.log("Event announcement..");

				commandAssistant(getBroadcastCommand(event_title,diff_mins));
			

	}

	function getBroadcastCommand(event_title, in_mins) {

		return `{
		  "command": " You have ${event_title} event starting in ${in_mins} minutes",
		  "broadcast": true,
		  "user": "techsudhagar@gmail.com" 
		  }`;
	  
	  
	  }


	function commandAssistant(assistant_request) {

		//console.log(`assistant_request..: ${assistant_request}`)
		console.info(`Assistant Command Executing..:${assistant_request}`);
		const options = {
		  hostname: 'localhost',
		  port: 3000,
		  path: '/assistant',
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
	  
		console.info(`Assistant Command Executed`);
	  
	  }

    module.exports = { notifyAssistant, showCamera,turnLightState,changeLightState};
