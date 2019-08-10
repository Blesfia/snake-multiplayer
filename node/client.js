let id = 1;
const Logger = require('./logger');
const logger = new Logger('Client');

class Client {
  constructor(socket, server) {
    this.socket = socket;
    this.server = server;
    this.score = 0;
    this.id = socket.snakeId || id++;
    socket.snakeId = this.id;
    this.position = null;
    this.username = null;
    this.inGame = false;
    this.direction = null;
    this.socket.on('move', this.move.bind(this));
    logger.log(`Created ${this.id}`);
  }

  move(direction) {
    this.direction = direction;
  }

  toSerialize() {
    return {
      position: this.position,
      score: this.score,
      id: this.id,
      username: this.username,
    };
  }
}

module.exports = Client;
