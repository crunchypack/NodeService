
# NodeService
Webservice with NodeJS
# NodeService
Webbtjänst som använder Node.js och express för att lagra filmer i en databas.
## Paket
### Bcrypt
Paket som används för att skydda lösenord med "hash".
### Express
Används för att hantera webbtjänstens olika metoder.
### Express-session
Paket som används för att lagra sessionsnycklar.
### Connect-mongo
Används för att kunna lagra sessioner som skapas av **express-session** i en mongodatabas.
### Moongose
Används för att koppla upp sig mot mongodatabas, och för att skapa scheman för att enklare lagra data.
### Cors
Ett paket som används för att tillåta Cross-origin resource sharing

## Starta server
```sh
$ node app.js
```
