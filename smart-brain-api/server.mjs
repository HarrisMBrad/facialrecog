import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import cors from 'cors';
import knex from 'knex';

// still need to test endpoint in postman... - BH
const db = knex({
      client: 'pg',
      connection: {
            host: '127.0.0.1',
            user: 'brad',
            password: '',
            database: 'smartbrain'
      }
});



const saltRounds = 10 // increase this if you want more iterations  
const userPassword = 'supersecretpassword'
const randomPassword = 'fakepassword'

const app = express();

app.use(bodyParser.json());
app.use(cors());
const database = {
      users: [
            {
                  id: '123',
                  name: 'John',
                  password: 'cookies',
                  email: 'john@gmail.com',
                  entries: 0,
                  joined: new Date()
            },
            {
                  id: '124',
                  name: 'Sally',
                  passwor: 'bananas',
                  email: 'sally@gmail.com',
                  entries: 0,
                  joined: new Date()
            }
      ],
      login: [
            {
                  id: '987',
                  hash: '',
                  email: 'john@gmail.com'

            }
      ]
}

app.get('/', (_req, res) => {
      res.send(database.users);
});

app.post('/signin', (_req, res) => {
      db.select('email', 'hash').from('login')
            .where('email', '=', _req.body.email)
            .then(data => {
                  const isValid = bcrypt.compareSync(_req.body.password, data[0].hash);
                  console.log(isValid);
                  if (isValid) {
                        return db.select('*').from('users')
                              .where('email', '=', _req.body.email)
                              .then(user => {
                                    console.log(user);
                                    res.json(user[0])
                              })
                        .catch(err => res.status(400).json('unable to get user...'))
                  
                  } else {
                        res.status(400).json('wrong credentials...')
                  }
                  
            })
      .catch(err => res.status(400).json('wrong credentials'))
});

app.post('/register', (_req, res) => {
      const { email, name, password } = _req.body;
      const hash = bcrypt.hashSync(password);
      // db transaction
      db.transaction(trx => {
            trx.insert({
                  hash: hash,
                  email: email

            })
                  .into('login')
                  .returning('email')
                  .then(loginEmail => {
                        return trx('users')
                              .returning('*')
                              .insert({
                                    email: loginEmail[0],
                                    name: name,
                                    joined: new Date()
                              })
                              .then(user => {
                                    res.json(user[0]);
                              })
                              .then(trx.commit)
                              .catch(trx.rollback)
                  })
      })

            .catch(err => res.status(400).json('unable to join register...'));
});

app.get('/profile/:id', (_req, res) => {
      const { id } = _req.params;
      db.status('*').from('users').where({ id })
            .then(user => {

                  if (user.length) {
                        res.json(user[0])
                  } else {
                        res.status(400).json('Not Found');
                  }

            })
            .catch(err => res.status(400).json('error getting user'))
});

app.put('/image', (_req, res) => {
      const { id } = _req.body;
      db('users').where('id', '=', id)
            .increment('entries', 1)
            .returning('entries')
            .then(entries => {
                  res.json(entries[0]);
            })
            .catch(err => res.status(400).json('unable to get entries...'))
});

const storeUserPassword = (password, salt) =>
      bcrypt.hash(password, salt).then(storeHashInDatabase)

const storeHashInDatabase = (hash) => {
      // Store the hash in your password DB
      return hash // For now we are returning the hash for testing at the bottom
}

// Returns true if user password is correct, returns false otherwise
const checkUserPassword = (enteredPassword, storedPasswordHash) =>
      bcrypt.compare(enteredPassword, storedPasswordHash)


// This is for demonstration purposes only.
storeUserPassword(userPassword, saltRounds)
      .then(hash =>
            // change param userPassword to randomPassword to get false
            checkUserPassword(userPassword, hash)
      )
      .then(console.log(randomPassword))
      .catch(console.error)



app.listen(3000, () => {
      console.log('app is running in port 3000');
});



