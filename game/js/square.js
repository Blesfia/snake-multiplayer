import constants from "./constants.js";

export default class Square extends HTMLElement {
  constructor(x, y, parent) {
    super();
    this.setPosition(x*constants.stage.squareSize, y*constants.stage.squareSize);
    this.width = constants.stage.squareSize;
    this.height = constants.stage.squareSize;
    this.parent = parent;
    Object.assign(
      this.style,
      {
        position: 'absolute',
        width: `${this.width}px`,
        height: `${this.height}px`,
      }
    );
  }

  setPosition(x, y) {
    this.oldX = this.x;
    this.oldY = this.y;
    this.x = x;
    this.y = y;
    Object.assign(
      this.style,
      {
        left: `${this.x}px`,
        top: `${this.y}px`,
      }
    );
  }
}

customElements.define('app-square', Square);
