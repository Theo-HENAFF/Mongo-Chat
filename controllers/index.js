function getMessages(req, res) {
    const Models = require('../models');
    Models.Message.find({}, function (err, messages) {
        if (err) throw err;
        res.json(messages);
    });
}


function promiseGetMessages(req, res) {
    return new Promise(function (resolve, reject) {
        const Models = require("../models");
        Models.Message.find({}).limit(100).exec(function (err, messages) {
            if (err) throw err;
            resolve(messages);
        });
    })
}


function getMessageByUser(req, res) {
    const Models = require('../models');
    Models.Message.find({user: req.params.username}, function (err, messages) {
        if (err) throw err;
        res.json(messages);
    });
}

function postMessage(req, res) {

    const Models = require('../models');
    const newMessage = Models.Message({
        user: req.body.user,
        content: req.body.content,
    });
    newMessage.save(function (err, mess) {
        if (err) throw err;
        res.send("Votre message à été sauvegarder avec succès");
    });
}

function postFromServer(req) {
    const Models = require("../models");

    const NewMessage = Models.Message({user: req.user, content: req.content})
    NewMessage.save(function (err, message) {
        if (err) return console.error(err);
    });
}

function deleteMessage(req, res) {

    const Models = require('../models');
    Models.Message.deleteOne({"_id": req.body.id}, function (err) {
        if (err) throw err;
        res.send("Message was deleted");
    });
}


module.exports.getMessages = getMessages;
module.exports.promiseGetMessages = promiseGetMessages;
module.exports.getMessageByUser = getMessageByUser;
module.exports.postMessage = postMessage;
module.exports.deleteMessage = deleteMessage;
module.exports.postFromServer = postFromServer;
