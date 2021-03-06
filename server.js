const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app).listen(3000);
const io = require('socket.io')(http);
let i;
const redis = require("redis");
const client = redis.createClient();
const controllers = require("./controllers")

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: false}));

const Routes = require('./routes');
app.use(Routes);



/**
 * Gestion des requêtes HTTP des utilisateurs en leur renvoyant les fichiers du dossier 'public'
 */
app.use('/', express.static(__dirname + '/public'));

/**
 * Liste des utilisateurs connectés
 */
var users = [];

/**
 * Liste des salles de chat
 */
var rooms = ['room1','room2','room3'];
/**
 * Liste des utilisateurs en train de saisir un message
 */
var typingUsers = [];
client.del("users-list"); //Delete la liste pour eviter probleme de déco


io.on('connection', function (socket) {
    socket.room = 'room1'
    /**
     * Utilisateur connecté à la socket
     */
    var loggedUser;

    /**
     * Emission d'un événement "user-login" pour chaque utilisateur connecté
     */
    for (i = 0; i < users.length; i++) {
        socket.emit('user-login', JSON.parse(users[i]));
    }


    /**
     * Emission d'un événement "chat-message" pour chaque message de l'historique
     */
    const old_messages = controllers.promiseGetMessagesByRoom({room:socket.room});
    old_messages.then(function (value) {
        for (const message of value) {
            const mess = {username: message.user, text: message.content, type: "chat-message"};
            socket.emit("chat-message", mess);
        }
    });



    /**
     * Déconnexion d'un utilisateur
     */
    socket.on('disconnect', function () {
        if (loggedUser !== undefined) {
            // Broadcast d'un 'service-message'
            var serviceMessage = {
                text: 'User "' + loggedUser.username + '" disconnected',
                type: 'logout'
            };
            socket.broadcast.emit('service-message', serviceMessage);
            // Suppression de la liste des connectés
            var userIndex = users.indexOf(loggedUser);
            if (userIndex !== -1) {
                users.splice(userIndex, 1);
            }
            // Emission d'un 'user-logout' contenant le user
            io.emit('user-logout', loggedUser);

            //Suppression du user de Redis
            client.lrem(['users-list',0,JSON.stringify(loggedUser) ], function(err, reply) { //REDIS - On enlève l'user de la db, on utilise la version stringifiée du json
                if (err) throw err;
                console.log(reply); // On s'assure que la suppression s'est bien faite
            });
            client.lrange("users-list",0,-1, function(err,reply) { // on remet à jour la variable users
                if (err) throw err;
                users=reply;
            });

        }
    });

    /**
     * Connexion d'un utilisateur via le formulaire :
     */
    socket.on('user-login', function (user, callback) {
        socket.username = user.username

        // Vérification que l'utilisateur n'existe pas
        var userIndex = -1;
        for (i = 0; i < users.length; i++) {
            if (JSON.parse(users[i]).username === user.username) {
                userIndex = i;
            }
        }
        if (user !== undefined && userIndex === -1) { // S'il est bien nouveau
            // Sauvegarde de l'utilisateur et ajout à la liste des connectés
            loggedUser = user;
            // users.push(loggedUser);

            //Envoi du user a Redis
            client.rpush(['users-list', JSON.stringify(loggedUser)], function(err, reply) {
                if (err) throw err;
                console.log(reply); // On s'assure que l'ajout s'est bien fait
            });
            client.lrange("users-list",0,-1, function(err,reply) { // on remet à jour la variable users
                if (err) throw err;
                users=reply;
                console.log(users);
            });

            //Le user join la room 1 par défaut
            socket.room = 'room1';
            socket.join('room1');



            // Envoi et sauvegarde des messages de service
            const userServiceMessage = {
                text: 'You logged in as "' + loggedUser.username + '"',
                type: 'login'
            };
            const broadcastedServiceMessage = {
                text: 'User "' + loggedUser.username + '" logged in',
                type: 'login'
            };
            socket.emit('service-message', userServiceMessage);
            socket.broadcast.emit('service-message', broadcastedServiceMessage);

            // Emission de 'user-login' et appel du callback
            io.emit('user-login', loggedUser);
            callback(true);
        } else {
            callback(false);
        }
    });

    /**
     * Réception de l'événement 'chat-message' et réémission vers tous les utilisateurs
     */
    socket.on('chat-message', function (message) {
        // On ajoute le username au message et on émet l'événement
        message.username = loggedUser.username;
        // On assigne le type "message" à l'objet
        message.type = 'chat-message';
        // io.emit('chat-message', message);
        socket.emit('chat-message', message);
        socket.broadcast.to(socket.room).emit('chat-message', message);

        // Sauvegarde du message
        controllers.postFromServer({user: socket.username, content: message.text, room: socket.room})
    });

    /**
     * Réception de l'événement 'start-typing'
     * L'utilisateur commence à saisir son message
     */
    socket.on('start-typing', function () {
        // Ajout du user à la liste des utilisateurs en cours de saisie
        if (typingUsers.indexOf(loggedUser) === -1) {
            typingUsers.push(loggedUser);
        }
        io.emit('update-typing', typingUsers);
    });

    /**
     * Réception de l'événement 'stop-typing'
     * L'utilisateur a arrêter de saisir son message
     */
    socket.on('stop-typing', function () {
        var typingUserIndex = typingUsers.indexOf(loggedUser);
        if (typingUserIndex !== -1) {
            typingUsers.splice(typingUserIndex, 1);
        }
        io.emit('update-typing', typingUsers);
    });

    /**
     * Réception de l'événement 'switchRoom'
     * afficher les messages d'une room
     */
    socket.on('loadRoomMessage', function () {
        const old_messages = controllers.promiseGetMessagesByRoom({room:socket.room});
        old_messages.then(function (value) {
            for (const message of value) {
                const mess = {username: message.user, text: message.content, type: "chat-message"};
                socket.emit("chat-message", mess);
            }
        });
    });

    /**
     * Réception de l'événement 'switchRoom'
     * L'utilisateur change de salle de chat
     */
    socket.on('switchRoom', function(newroom){
        const oldroom = socket.room
        // Emission d'un 'user-logout' contenant le user
        io.emit('user-logout', socket.username);

        // leave the current room (stored in session)
        socket.leave(socket.room);
        // join new room, received as function parameter
        socket.room = newroom;
        socket.join(newroom);

        // Envoi et sauvegarde des messages de service
        const oldbroadcastedServiceMessage = {
            text: 'User "' + socket.username + '" logged out of this room',
            type: 'logout'
        };
        const newbroadcastedServiceMessage = {
            text: 'User "' + socket.username + '" logged in this room',
            type: 'login'
        };
        const userServiceMessage = {
            text: 'You are logged in room "' + newroom + '"',
            type: 'login'
        };
        socket.emit('service-message', userServiceMessage);
        socket.broadcast.to(oldroom).emit('service-message', oldbroadcastedServiceMessage);
        socket.broadcast.to(newroom).emit('service-message', newbroadcastedServiceMessage);
    });
});


/**
 * Lancement du serveur en écoutant les connexions arrivant sur le port 3000
 */
const mongoose = require('mongoose');
database = 'mongodb://localhost:27017/CHAT';
mongoose.connect(database, (err) => {
    if (err)
        throw err;
    console.log('Connect to the database');
});
console.log("Waiting on localhost:3000");


module.exports = app;
