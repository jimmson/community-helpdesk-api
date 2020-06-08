const twillio = require('express').Router();
const appRoot = require('app-root-path');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const Category = require(appRoot + '/models/Category');
const Ticket = require(appRoot + '/models/Ticket');
const Area = require(appRoot + '/models/Area');

// Create a locale
twillio.post('/', async (req, res) => {
    const twiml = new VoiceResponse();
    const category = new Category();
    const cats = await category.list("public");
    const area = new Area();
    const areas = await area.list();

    try {
        if (req.body.Digits <= cats.length && req.body.Digits > 0 ) {
            
            cat = cats[parseInt(req.body.Digits)-1]

            const ticket = new Ticket();
            await ticket.add({
                phone: req.body.From,
                category: cat._id,
                area: areas[0]._id,
            });

            twiml.say(`We have recieved your request for assistance with ${cat.name}.`);
            twiml.say(`Expect a call from one of our volunteer soon. Bye.`);

        } else {
            twiml.say('Welcome to the Covid SA helpline');

            const gather = twiml.gather({ numDigits: 1 });
            
            var i = 1;
            cats.forEach(cat => {
                gather.say(`For assistance with ${cat.name}, press ${i}.`);
                i++;
            });
        }
    } catch (err) {
        handleError(err, res);
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());

})

module.exports = twillio;