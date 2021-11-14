// const messagebird = require('messagebird')(process.env.API_KEY_MESSAGE);
const accountSid = process.env.TWILIO_ACC_SID;
const authToken = process.env.TWILIO_ACC_AUTH;

const twilio = require('twilio');
exports.sms = async (message, reciver) => {
  const client = new twilio(accountSid, authToken);

  client.messages
    .create({
      body: message,
      to: reciver, // Text this number
      from: '12028314261', // From a valid Twilio number
    })
    .then((message) => console.log(message.sid))
    .catch((err) => console.log(err));
};

// exports.sms = class {
//   constructor(user, url) {
//     this.number = user.numberPhone;
//     this.url = url;
// this.from = 'Allo Maallem'
//   }
//   send() {
//     const client = new twilio(accountSid, authToken);
//     client.messages
//       .create({
//         body: this.message,
//         to: this.reciver,
//         from: '12028314261',
//       })
//       .then((message) => console.log(message.sid))
//       .catch((err) => console.log(err));
//   }

//   sendResetPass(message, reciver) {
//     this.send(message, reciver);
//   }
// };
