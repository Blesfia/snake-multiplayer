import Square from "./square.js";

export default class Wall extends Square {
  constructor(x, y, parent) {
    super(x, y, parent);
    this.style.backgroundColor = '#ccc';
    this.style.width = `${this.width - 2}px`;
    this.style.height = `${this.height - 2}px`;
    this.style.border = '1px black solid';
    this.style.zIndex = 10;
  }
}

customElements.define('app-wall', Wall);
