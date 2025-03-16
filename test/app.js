const { Client } = require('pg');

const client = new Client({
  user: 'root',
  host: '217.154.16.191',
  database: 'feelmap',
  password: 'ceFqn8hC',
  port: 5432,
  connectionTimeoutMillis: 30000
});

client.connect()
  .then(() => console.log('Connexion réussie!'))
  .catch(e => console.error('Erreur de connexion:', e))
  .finally(() => client.end());