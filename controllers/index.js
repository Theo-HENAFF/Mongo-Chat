function getMessages(req,res){
    const Models = require('../models');
    Models.Message.find({}, function (err, messages) {
        if (err) throw err;
        res.json(messages);
    });
}

function postMessage(req,res){

    const Models = require('../models');

    const newMessage = Models.Message({
        user:req.body.user,
        content: req.body.content,
    });
    newMessage.save(function (err,mess) {
        if (err) throw err;
        res.send("Votre message à été sauvegarder avec succès");
    });
}

function deleteMessage(req,res){

    const Models = require('../models');
    Models.Message.deleteOne({"_id":req.body.id},function(err) {
        if (err) throw err;
        res.send("Message was deleted");
    });
}
module.exports.getMessages = getMessages;
module.exports.postMessage = postMessage;
module.exports.deleteMessage = deleteMessage;
