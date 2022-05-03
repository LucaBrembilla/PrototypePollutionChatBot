// This is a simple chat API:
//
// - All users can see all messages.
// - Registered users can post messages.
// - Administrators can delete messages.
//
// The challenge is to delete any message without admin password.
//
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const app = express();

///////////////////////////////////////////////////////////////////////////////
// In order of simplicity we are not using any database. But you can write the
// same logic using MongoDB.
const users = [
  // You know password for the user.
  {name: 'user', password: 'pwd'},
  {name: 'user2', password: 'pwd2'},
  // You don't know password for the admin.
  {name: 'admin', password: Math.random().toString(32), canDelete: true},
];

let messages = [];
let lastId = 1;

function findUser(auth) {
  return users.find((u) =>
    u.name === auth.name &&
    u.password === auth.password);
}
///////////////////////////////////////////////////////////////////////////////

app.use(bodyParser.json());

// Get all messages (publicly available).
app.get('/', (req, res) => {
  res.send(messages);
});

// Post message (restricted for users only).
/* app.put('/', (req, res) => {
  const user = findUser(req.body.auth || {});

  if (!user) {
    res.status(403).send({ok: false, error: 'Access denied'});
    return;
  }

  const message = {
    // Default message icon. Cen be overwritten by user.
    icon: '👋',
  };

  // You can use lodash merge function (old version) to perform prototype pollution 
  
  //_.merge(message, req.body.message, {
  
  merge(message, req.body.message);
  merge(message, {
    // Lodash can use more than two arguments in the merge function
    id: lastId++,
    timestamp: Date.now(),
    userName: user.name,
  });

  messages.push(message);
  res.send({ok: true});
}); */

// Using safeMerge
app.put('/', (req, res) => {
  const user = findUser(req.body.auth || {});

  if (!user) {
    res.status(403).send({ok: false, error: 'Access denied'});
    return;
  }

  const message = {
    // Default message icon. Cen be overwritten by user.
    icon: '👋',
  };

  message = safeMerge(message, req.body.message);
  message = safeMerge(message, {
    // Lodash can use more than two arguments in the merge function
    id: lastId++,
    timestamp: Date.now(),
    userName: user.name,
  });

  messages.push(message);
  res.send({ok: true});
});

// Delete message by ID (restricted for users with flag "canDelete" only).
app.delete('/', (req, res) => {
  const user = findUser(req.body.auth || {});

  if (!user || !user.canDelete) {
    res.status(403).send({ok: false, error: 'Access denied'});
    return;
  }

  messages = messages.filter((m) => m.id !== req.body.messageId);
  res.send({ok: true});
});

/**
 * Sets or updates all attributes of the source object on the target object.
 *
 * For example if `target` is {a: 1, b: 2} and `source` is {a: 3, c: 4},
 * after calling this function `target` becomes {a: 3, b: 2, c: 4}.
 */
function merge(target, source) {
  for (const attr in source) {
    if (
      typeof target[attr] === "object" &&
      typeof source[attr] === "object"
    ) {
      merge(target[attr], source[attr])
    } else {
      target[attr] = source[attr]
    }
  }
}

function safeMerge(target, source){
  const saveToDatabase = Object.create(null);
  merge(saveToDatabase, target);
  merge(saveToDatabase, source);
  return saveToDatabase;
}

app.listen(3000);
console.log('Listening on port 3000...');
