/**
 * @license
 * Copyright Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// [START gmail_quickstart]
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
//var base64 = require('js-base64').Base64;
var assistant = require('../../modules/assistant/commandAssistant.js');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
const FRONT_MOTION = 'YoLink Your Front Sensor (d88b4c010002ccf3) detected someone pass.';
const FRONT_CAM_MOTION = 'An alarm from Front Door.';
const KIDS_LIGHT_SENSOR = 'Device Alarm : Kids Light Sensor';
const SENSOR_MOTION_TEXT = 'detected someone pass';
const FRONT_CAM_BODY = 'Time:';


// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  //authorize(JSON.parse(content), listLabels);
  authorize(JSON.parse(content), listEmails);
  //authorize(JSON.parse(content), watchInbox);


});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}
/*
function watchInbox(auth) {
const gmail = google.gmail({ version: 'v1', auth });
const respose = gmail.users.watch({
  userId: 'techsudhagar@gmail.com',
  requestBody: {
    // Replace with `projects/${PROJECT_ID}/topics/${TOPIC_NAME}`
    //topicName: 'projects/sun-smart-home-301512/topics/SensorNotification'
    topicName: 'projects/sun-smart-home-301512/topics/SensorNotification',
  },
});

console.log(` Gmail Watch Status..: ${respose.data}`);

}

*/

function listEmails(auth) {

  const gmail = google.gmail({ version: 'v1', auth });

  var today1 = new Date();


  gmail.users.messages.list({
    userId: 'me',
    maxResults: 3,
    q: 'deals2sun@gmail.com || from:no-reply@yosmart.com'
  }, (err, res) => {
    if (err) return console.log('The API returned an error: List: ' + err);
    const emails = res.data.messages;
    if (emails.length) {
      //console.log('Emails:');
      emails.forEach((email) => {
        //console.log(`- ${email.id}`);
        gmail.users.messages.get({
          userId: 'me',
          id: email.id


        }, (err, res) => {
          if (err) return console.log('The API returned an error Get: ' + err);
          const email_msg = res.data.snippet;
          var received_date;
          var alert_date;
          var last_alert_diff;


          console.log(` Actual Email..: ${email.id}:..:${email_msg}`);


          const headers = res.data.payload.headers;
          const today = new Date();

          if (headers.length) {

            var is_motion_detected = false;

            var kids_light_sensor = false;
            headers.forEach((header) => {

              if (header.name == 'Subject') {

                // console.log(`header.name ${header.value}`);

                if (header.value == FRONT_CAM_MOTION) {

                  received_date = email_msg.split(' ');

                  received_date = received_date[1] + ' ' + received_date[2];

                  //console.log(`Front Door Receive Date..: ${received_date}`);

                  alert_date = new Date(received_date);

                  last_alert_diff = today - alert_date;

                  // console.log(`Time diff ${today}:..:${alert_date}:..: ${last_alert_diff}`);

                  if (last_alert_diff <= 50000) {
                    //console.log('Assistant Called');
                    assistant.showCamera('Front Door');

                  }


                } else if (header.value.includes(KIDS_LIGHT_SENSOR)) {

                  if (email_msg.includes(SENSOR_MOTION_TEXT)) {


                    kids_light_sensor = true;

                  }

                }



              } else if (header.name == 'X-Received') {
                is_motion_detected = newNotificationByReceivedDate(header.value);

              }

            });

            if (is_motion_detected && kids_light_sensor) {

              assistant.changeLightState('Tube Light', 'On');
            }

            is_motion_detected = false;

            kids_light_sensor = false;

          }


        });

      });
    } else {
      console.log('No email found.');
    }
  });


}

function isFrontCamNewNotification(received_date) {


  received_date = received_date.substring(6, received_date.length);

  console.log(`After Time trim..:${received_date}`);
  const today = new Date();

  const alert_date = new Date(received_date);

  //alert_date.setHours(alert_date.getHours() + 2);

  const last_alert_diff = today - alert_date;

  console.log(` From Cam Time  ${last_alert_diff} :..: ${alert_date}`);

  if (last_alert_diff <= 5000) {
    //console.log(`Date Object.. ${alert_date}:..: ${today-alert_date}`);
    assistant.showCamera('Front Door');

    return true;

  }

  return false;


}

function newNotificationByReceivedDate(received_date) {

  const today = new Date();

  received_date = received_date.split(';');
  received_date = received_date[1].split('-');
  //console.log(`Date Only.. ${received_date[0]}`);

  const alert_date = new Date(received_date[0]);

  alert_date.setHours(alert_date.getHours() + 2);

  const last_alert_diff = today - alert_date;

  console.log(` Time diif.. ${last_alert_diff}`);

  if (last_alert_diff <= 50000) {
    //console.log(`Date Object.. ${alert_date}:..: ${today-alert_date}`);
    //assistant.showCamera('Front Door');

    return true;

  }

  return false;

}
//setInterval(listEmails, 5000);
// [END gmail_quickstart]

module.exports = {
  SCOPES,
  listLabels,
  listEmails,
};
