import constants from "./constants.js";
import Wall from "./wall.js";
import Fruit from "./fruit.js";
import Snake from "./snake.js";

export default class Stage extends HTMLDivElement {
  constructor() {
    super();
    Object.assign(
      this.style,
      {
        width: `${constants.stage.size}px`,
        height: `${constants.stage.size}px`,
        'background-color': "#eee",
        position: 'fixed',

      });
    constants.stage.instance = this;
    this.dummies = {};
    this.configure();
  }

  configure() {
    for (let column = 0; column < constants.stage.columns ; column += 1) {
      this.appendChild(new Wall(column, 0, this));
      this.appendChild(new Wall(
        column,
        constants.stage.columns - 1, this));
    }

    for (let row = 1; row < constants.stage.columns - 1; row += 1) {
      this.appendChild(new Wall(0, row, this));
      this.appendChild(new Wall(
        constants.stage.columns - 1, row, this));
    }
  }

  fruit(position, id) {
    console.log('Fruit ate by', id, 'new will be in', position)
    if (id) {
      this.dummies[id].increaseSize();
    }
    if (this.fruitObject) {
      this.removeChild(this.fruitObject);
    }
    this.fruitObject = new Fruit(...position, this);
    this.appendChild(this.fruitObject);
  }

  update(data) {
    for (const player of data) {
      this.moveDummy(player.position, player.id.toString());
    }
    for (let dummy of Object.keys(this.dummies)) {
      if (!data.find(e => e.id.toString() === dummy)) {
        console.log('Remove player')
        this.removeChild(this.dummies[dummy]);
        delete this.dummies[dummy];
      }
    }
  }

  moveDummy(position, id) {
    if (!(id in this.dummies)) {
      this.dummies[id] = new Snake(...position, this, id === window.snake.server.playerId);
      console.log('Add player', id, this.dummies)
      this.appendChild(this.dummies[id]);
    } else {
      this.dummies[id].setPosition(...position.map(e => e*constants.stage.squareSize));
      this.dummies[id].update();
    }
  }
}

customElements.define('app-stage', Stage, { extends: 'div' });
