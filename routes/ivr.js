var express = require('express');
var router = express.Router();
var twilio = require('twilio');

// POST: '/ivr/welcome'
router.post('/welcome', twilio.webhook({validate: false}), function (request, response) {
    // TwIML 是一個回應的設定物件
    var twiml = new twilio.TwimlResponse();  
    twiml.gather({
        action: "/ivr/menu",  // 同 form 的 action
        numDigits: "1",       // 使用者輸入的數字長度
        method: "POST"        // 同 form 的 method
    }, function (node) {
        node.play("http://howtodocs.s3.amazonaws.com/et-phone.mp3", {loop: 3}); // 回應一段語音
    });
    response.send(twiml); // 回覆這個物件
});

// POST: '/ivr/menu'
router.post('/menu', twilio.webhook({validate: false}), function (request, response) {
    // 取出使用者輸入
    var selectedOption = request.body.Digits;

    // 設定選項
    var optionActions = {
        "1": giveExtractionPointInstructions,
        "2": listPlanets
    };

    // 根據使用者輸入設定回應物件內容
    if (optionActions[selectedOption]) {
        var twiml = new twilio.TwimlResponse();
        optionActions[selectedOption](twiml);
        response.send(twiml);
    }
    response.send(redirectWelcome());
});

// POST: '/ivr/planets'
router.post('/planets', twilio.webhook({validate: false}), function (request, response) {
    var selectedOption = request.body.Digits;
    var optionActions = {
        "2": "+12024173378",
        "3": "+12027336386",
        "4": "+12027336637"
    };

    if (optionActions[selectedOption]) {
        var twiml = new twilio.TwimlResponse();
        twiml.dial(optionActions[selectedOption]);
        response.send(twiml);
    }
    response.send(redirectWelcome());
});

var giveExtractionPointInstructions = function (twiml) {

    // 這裡可以設定一段要自動回復的英文敘述(中文不知可否)，並指定要由誰發音(voice: "alice")和語言
    twiml.say("To get to your extraction point, get on your bike and go down " +
        "the street. Then Left down an alley. Avoid the police cars. Turn left " +
        "into an unfinished housing development. Fly over the roadblock. Go " +
        "passed the moon. Soon after you will see your mother ship.",
        {voice: "alice", language: "en-GB"});

    twiml.say("Thank you for calling the ET Phone Home Service - the " +
        "adventurous alien's first choice in intergalactic travel");

    // "請不要掛斷，我將為您轉接" 之後那段等待
    twiml.hangup();
    return twiml;
};

var listPlanets = function (twiml) {
    twiml.gather({
        action: "/ivr/planets",
        numDigits: "1",
        method: "POST"
    }, function (node) {
        node.say("To call the planet Broh doe As O G, press 2. To call the planet " +
            "DuhGo bah, press 3. To call an oober asteroid to your location, press 4. To " +
            "go back to the main menu, press the star key ",
            {voice: "alice", language: "en-GB", loop: 3});
    });
    return twiml;
};

var redirectWelcome = function () {
    var twiml = new twilio.TwimlResponse();
    twiml.say("Returning to the main menu", {voice: "alice", language: "en-GB"});
    twiml.redirect("/ivr/welcome");
    return twiml;
};


module.exports = router;