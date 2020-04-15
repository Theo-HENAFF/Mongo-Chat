# Socket.io / MongoDB: Chat


* Stockage des users dans Redis (utiliser un redis-cli pour les afficher " LRANGE users-list ")
* Les messages sont stocké sur une base mongodb (db: CHAT colletion : messages)
* Utilisation Replicaset (vor le ficher ReplicaSet.docx pour la démarche)




## Installation

Installer Bowser
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

Contributeurs : HENAFF , NASRI


