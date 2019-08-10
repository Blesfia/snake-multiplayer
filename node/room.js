/** How many blocks will be allowed */
const columns = 40;
const Logger = require('./logger');
let id = 1;
class Room {
  constructor(server) {
    this.players = {}
    this.status = 'open';
    this.scores = {};
    this.fruit = null;
    this.server = server;
    this.id = id++;
    this.createdAt = new Date();
    this.logger = new Logger(`Room ${this.id}`);
    this.logger.log(`Created ${this.id}`);
    setTimeout(this.start.bind(this), 30000);
  }

  addPlayer(client, data) {
    if (client.inGame) {
      this.logger.log(`Client ${client.id} reconnected to room ${this.id}`);
      client.socket.join(this.id);
      return true;
    }
    if (this.status !== 'open') {
      this.logger.log(`Room busy for client ${client.id}`);
      return false;
    }
    if (Object.keys(this.players).length < 4) {
      client.inGame = true;
      client.room = this.id;
      client.username = data.username;
      client.position = this.getPositionOfPlayer(Object.keys(this.players).length),
        this.players[client.username] = client;
      client.socket.join(this.id, this.playerJoined.bind(this, client));
      return true;
    }
    this.logger.log(`Client ${client.id} rejected due unknown reason. players=${JSON.stringify(Object.keys(this.players))}`);
    return false;
  }

  playerJoined(client) {
    this.logger.log(`Client ${client.id} (${client.username}) joined to room.`);
    this.server.io.to(this.id).emit('new-member', Object.keys(this.players).length, this.createdAt.getTime() + 30000);
    client.socket.on('die', this.killPlayer.bind(this, client));
    client.socket.on('disconnect', this.killPlayer.bind(this, client));
  }

  getPositionOfPlayer(n) {
    if (n === 0) {
      return [1, 1];
    } else if (n === 1) {
      return [columns - (1 * 2), columns - (1 * 2)];
    } else if (n === 2) {
      return [1, columns - (1 * 2)];
    } else if (n === 3) {
      return [columns - (1 * 2), 1];
    }
  }

  start() {
    if (this.status !== 'open') {
      return;
    }
    this.logger.log(`Start for ${Object.keys(this.players).length} player!`);
    this.status = 'game';
    this.server.io.to(this.id).emit('start', { columns });
    this.emitNewFruit();
    this.updateInterval = setInterval(this.update.bind(this), 100);
  }

  emitNewFruit(eater) {
    this.fruit = this.getRandomPosition();
    this.logger.log(`New fruit in x=${this.fruit[0]} y=${this.fruit[1]}`);
    this.server.io.to(this.id).emit('fruit', this.fruit, eater);
  }

  update() {
    for (const player of Object.values(this.players)) {
      switch (player.direction) {
        case 'up':
          player.position[1] -= 1;
          break;
        case 'down':
          player.position[1] += 1;
          break;
        case 'left':
          player.position[0] -= 1;
          break;
        case 'right':
          player.position[0] += 1;
          break;
      }
      if (this.fruit[0] === player.position[0] && this.fruit[1] === player.position[1]) {
        player.score = player.score + 1;
        this.emitNewFruit(player.id);
      }
    }
    // console.log(this.id, Object.values(this.players).length)
    this.server.io.to(this.id).emit('tick', Object.values(this.players).map(e => e.toSerialize()));
  }

  killPlayer(client) {
    const clientId = client.username;
    if (clientId in this.players) {
      this.logger.log(`Client ${client.id} lose`);
      this.scores[clientId] = client.score;
      delete this.players[clientId];
      if (Object.keys(this.players).length <= 1) {
        return this.declareWinner(clientId);
      }
    }
  }

  declareWinner(deleted) {
    clearInterval(this.updateInterval);
    this.status = 'finished';
    const winnerId = Object.keys(this.players)[0];
    if (winnerId) {
      const winner =  this.players[winnerId];
      this.logger.log(`Winner is ${winner.username}`);
      this.server.io.to(this.id).emit('winner', { winnerId, score: winner.score, data: this.scores });
    } else {
      this.logger.log(`Winner is ${deleted}`);
      this.server.io.to(this.id).emit('winner', { winnerId: deleted, score: this.scores[deleted], data: this.scores });
    }
    this.server.io.in(this.id).clients((error, socketIds) => {
      socketIds.forEach(socketId => this.server.io.sockets.sockets[socketId].leave(this.id));
    });
  }

  getRandomPosition() {
    /** f(x) = (rnd()(max - min)) + min --> [min, max] E R */
    const randomNumber = (min, max) => (Math.random() * (max - min)) + min
    /** g(x) = round(f(x)/dif)*dif */
    const randomPosition = (min, max) => Math.round(randomNumber(min, max) / min) * min;
    return [
      randomPosition(1, columns - 2),
      randomPosition(1, columns - 2),
    ]
  }
}

module.exports = Room;
