import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import cors from 'cors';

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
      if (_req.body.email === database.users[0].email &&
            _req.body.password === database.users[0].password) {
            res.json('success');
      } else {
            res.status(400).json('error logging in...');
      }
      res.json('signing');
});

app.post('/register', (_req, res) => {
      const { email, name } = _req.body;
      //bcrypt.hash(password, null, null, function (_err, _hash) {
            console.log(_hash);
            //just replace the _hash with the long string that is made.
            // store and define _hash in your password DB
      //});
      database.users.push({
            id: '125',
            name: name,
            email: email,
            entries: 0,
            joined: new Date()
      })
      res.json(database.users[database.users.length - 1]);
});

app.get('/profile/:id', (_req, res) => {
      const { id } = _req.params;
      let found = false;
      database.users.forEach(user => {
            if (user.id === id) {
                  found = true;
                  return res.json(user);
            }
      })
      if (!found) {
            res.status(400).json('not found.')
      }
});

app.put('/image', (_req, res) => {
      const { id } = _req.body;
      let found = false;
      database.users.forEach(user => {
            if (user.id === id) {
                  found = true;
                  user.entries++;
                  return res.json(user.entries);
            }
      })
      if (!found) {
            res.status(400).json('not found.');
      }

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



