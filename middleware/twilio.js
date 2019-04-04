const { MessagingResponse } = require('twilio').twiml;


module.exports.handle_incoming_messages = (req, res, next) => {
    const twiml = new MessagingResponse();
    const { Body: clientMessage } = req.body;
    console.log(req.body)
    if (+clientMessage === 1) {
        twiml.message('you have choosen option 1');
    } 
    if (+clientMessage === 2) {
        twiml.message('you have choosen option 2');
    } 
    if (+clientMessage === 3) {
        twiml.message('you have choosen option 3');
    } 
    if (+clientMessage === 4) {
        twiml.message('you have choosen option 4');
    } 
    if (+clientMessage === 5) {
        twiml.message('you have choosen option 5');
    } else {
        // twiml.message('The Robots are coming! Head for the hills!');
        twiml.message('Thank you for contacting Birthride. We are currently working to find the closest driver to you. We thank you for your patience.');
    }
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
}