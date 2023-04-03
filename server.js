const http = require('http');
const app = require('./app');
const os = require('os');

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || 3000);
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);
const io = require('socket.io')(server);

// SOCKET IO

let userChat = [];

const chat = io.of('/chat').on('connection', function (socket) {

  socket.on('IDENT', message => {
    socket.user = message;
    userChat.push({ id: socket.id, user: message });
    chat.emit('USERS', JSON.stringify(userChat));
  });

  socket.on('MSG', message => {
    chat.emit('MSG', message);
  });

  socket.on('disconnect', function () {

    userChat = userChat.filter(item => item.id !== socket.id);
    chat.emit('USERS', JSON.stringify(userChat));
    chat.emit('MSG', { user: 'SERVER', msg: `L'utilisateur ${socket.user} s'est déconnecté` });
  });

});

const memoire = io.of('/memoire').on('connection', function (socket) {
  console.log('Connexion mémoire');

  console.log('user connected');

  let oldTotal = [0, 0, 0, 0, 0, 0, 0, 0];
  let oldIdle = [0, 0, 0, 0, 0, 0, 0, 0];

  setInterval(() => {

    const cpus = os.cpus();
    const memFree = os.freemem();
    const memTotal = os.totalmem();

    let tab = [];

    for (let i = 0, len = cpus.length; i < len; i++) {

      let total = 0;
      var cpu = cpus[i];
      for (var type in cpu.times) {
        total += cpu.times[type];
      }

      const diffIdle = cpu.times['idle'] - oldIdle[i];
      const diffTotal = total - oldTotal[i];
      const pourcentage = 100 - (diffIdle * 100 / diffTotal)

      tab.push(pourcentage.toFixed(2).toString().padStart(6, ' '));

      oldTotal[i] = total;
      oldIdle[i] = cpu.times['idle'];
    }

    socket.emit('CPU', tab.join('|'));
    socket.emit('MEM', { memFree, memTotal });
  }, 1000)

  socket.on('disconnect', function () {
    console.log('user disconnected.');
  });

});

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});
server.listen(port);


