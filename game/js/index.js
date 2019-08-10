import constants from "./constants.js";
import Stage from "./stage.js";
var server = io.connect("https://blesfia-snake.herokuapp.com");

// @TODO Ask for the username and replace it
server.emit("connect-to-room", { username: Date.now() });
window.snake = { server };
let stage;
let remainingCount;
// Show connection information
server.on("new-member", (data, startAt) => {
  console.log('Room', 'new-member');
  if (!remainingCount) {
    remainingCount = setInterval(() => {
      document.getElementById("participants").innerHTML =
        "There are " + data + " in the room. Starting in " + (startAt - new Date().getTime()) / 1000;
    }, 1000)
  }
});
server.on("start", ({ columns }) => {
  if (remainingCount) {
    clearInterval(remainingCount);
  }
  console.log('Room', 'start');
  constants.stage.columns = columns;
  constants.stage.squareSize = constants.stage.size/columns;
  document.createElement('app-stage');
  stage = new Stage();
  document.getElementById('game').appendChild(stage);
  // Move player
  window.addEventListener('keydown', (ev) => {
    const key = ev.keyCode;
    console.log(ev.keyCode);
    if (key === 37 || key === 65) {
      return server.emit('move', 'left');
    }
    if (key === 38 || key === 87) {
      return server.emit('move', 'up');
    }
    if (key === 39 || key === 68) {
      return server.emit('move', 'right');
    }
    if (key === 40 || key === 83) {
      return server.emit('move', 'down');
    }
  });
});
server.on("tick", data => {
  if (stage) {
    stage.update(data, server.id);
  }
});
server.on("winner", ({ winner, score, data}) => {
  console.log('Winner', winner, score, data);
  if (winner === server.id) {
    alert('Congratulation!, You are the winner. Your score: ' + score);
  } else {
    alert('Try it again!, Winner score: ' + score +  ' Your score: ' + data[server.id]);
  }
  location.reload()
});
server.on("fruit", (data, id, aux) => {
  stage.fruit(data, id);
});
server.on("increaseSize", () => {
  stage.player.increaseSize();
});
server.on('configuration', (id) => {
  server.playerId = id.toString();
})
