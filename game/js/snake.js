import Wall from "./wall.js";
import Square from "./square.js";
import constants from "./constants.js";

export default class Snake extends Square {
  constructor(x, y, parent, isPlayer, isTail) {
    super(x, y, parent);
    this.isPlayer = isPlayer;
    this.isTail = isTail;
    this.style.zIndex = isPlayer ? 0 : 10;
    this.style.backgroundColor = isPlayer ? 'black' : 'green';
  }

  disconnectedCallback() {
    if (this.tail) {
      constants.stage.instance.removeChild(this.tail);
    }
  }

  update() {
    if (this.isPlayer && !this.isTail && !window.snake.died) {
      const element = document.elementFromPoint((this.x * constants.stage.squareSize) + 4, (this.y * constants.stage.squareSize) + 4);
      if (element instanceof Wall || (element instanceof Snake && !element.isPlayer)) {
        console.log(element, this.x + 4, this.y + 4)
        this.die();
      }
    }
    if (this.isTail) {
      this.setPosition(this.parent.oldX, this.parent.oldY)
    }
    if (this.tail) {
      this.tail.update();
    }
  }

  die() {
    window.snake.server.emit('die');
    window.snake.died = true;
  }

  increaseSize() {
    if (!this.tail) {
      this.tail = new Snake(this.oldX, this.oldY, this, this.isPlayer, true);
      constants.stage.instance.appendChild(this.tail);
    } else {
      this.tail.increaseSize();
    }
  }
}
customElements.define('app-snake', Snake);
