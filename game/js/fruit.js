import Square from "./square.js";

export default class Fruit extends Square {
  constructor(x, y, parent) {
    super(x, y, parent);
    this.style.zIndex = 10;
    this.style.backgroundColor = 'red';
  }
}
customElements.define('app-fruit', Fruit);
