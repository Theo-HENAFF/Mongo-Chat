# Socket.io / MongoDB: Chat


* Stockage des users dans Redis (utiliser un redis-cli pour les afficher " LRANGE users-list ")
* Les messages sont stockés sur une base mongodb (db: CHAT collection : messages)
* A la connexion d'un utilisateur les messages précédents sont affichés après un GET depuis MongoDB
* Utilisation Replicaset (vor le ficher ReplicaSet.docx pour la démarche)




## Installation

Installer Bower
```
npm install -g bower
```

Pour installer l'application, téléchargez les sources (zip ou git clone) et exécutez la commande suivante depuis la racine du projet.
```
npm install
bower install
```

## Démarrer l'application

Pour démarrer l'application, exécutez la commande suivante depuis la racine du projet.
```
node server
```

L'application est désormais accesssible à l'url **http://localhost:3000/**.

## Quelques requêtes mongo utiles:
Lancer ces requêtes sur un mongo shell connecté à la base CHAT.

Avoir tous les messages d'un user par son username (ici "toto"):
```
db.messages.find({user:"toto"}).pretty()
```

L'utilisateur qui a envoyé le plus de messages
```
db.messages.aggregate({$group:{_id:"$user",nombreMessage:{$sum:1}}},{$sort:{nombrebMessage:-1}},{$limit:1})
```
La room la plus utiisée : 

```
db.messages.aggregate({$group:{_id:"$room",nombreMessage:{$sum:1}}},{$sort:{nombreMessage:-1}},{ $limit:1 })
```

Contributeurs : HENAFF , NASRI


