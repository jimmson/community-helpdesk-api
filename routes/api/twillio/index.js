const twillio = require('express').Router();
const appRoot = require('app-root-path');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const Category = require(appRoot + '/models/Category');
const Ticket = require(appRoot + '/models/Ticket');
const Area = require(appRoot + '/models/Area');

// Create a locale
twillio.post('/', async (req, res) => {
    const url = "https://covidsa.help/api/twillio";
    const twiml = new VoiceResponse();
    const category = new Category();
    const categories = await category.list("public");
    const area = new Area();
    const areas = await area.list("public");

    area.id = req.query.area;
    category.id = req.query.category;
    
    let a = await area.get().catch((err) => { console.error("err"); });
    let c = await category.get().catch((err) => { console.error("err"); });
    let d = req.body.Digits
    

    if (a == null) {

        if (d <= areas.length && d > 0) {
            area.id = areas[d-1]._id;
            twiml.redirect({method: "POST"}, `${url}?area=${area.id}&category=${category.id}`);
        } else {
            twiml.say('Welcome to the Covid SA helpline');

            const gather = twiml.gather({ numDigits: 1 });
            areas.forEach((a, i) => {
                gather.say(`For assistance in ${a.name}, press ${i+1}.`);
            });
        }

    } else if (c == null) {

        if (d <= categories.length && d > 0) {
            category.id = categories[d-1]._id;
            twiml.redirect({method: "POST"}, `${url}?area=${area.id}&category=${category.id}`);
        } else {

            const gather = twiml.gather({ numDigits: 1 });
            categories.forEach((c, i) => {
                gather.say(`For assistance with ${c.name}, press ${i+1}.`);
            });
        }

    } else {

        const ticket = new Ticket();
        await ticket.add({
            phone: req.body.From,
            category: c._id,
            area: a._id,
        });

        twiml.say(`We have recieved your request for assistance in ${a.name}.`);
        twiml.say(`With ${c.name}.`);
        twiml.say(`Expect a call from one of our volunteer soon. Bye.`);

    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
})

module.exports = twillio;