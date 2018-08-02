## CEST QUOI DONC PREVU POUR

Micro webservice d'accès au format json des donnees de la taxation 
concernant la taxe de sejour votees par les collectivites et publiees 
par la [DGFiP](https://www.impots.gouv.fr/portail/taxe-de-sejour)


## ET COMMENT QU ON FAIT

- Aller sur le site de la [DGFiP](https://www.impots.gouv.fr/portail/taxe-de-sejour)
- Telecharger l'archive et la dezipper dans le repertoire DATA
- Modifier le nom/path d'acces au fichier en consequence dans SERVER.JS
- Et dans une console, à la racine du projet: `npm install && npm start`
- Enfin, ouvrir un navigateur qui pointe en local sur [http://localhost:3000/deliberations](http://localhost:3000/deliberations)
  pour afficher toutes les délibérations publiées.
