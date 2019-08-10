module.exports = class Log {
  constructor(context) {
    this.context = context;
  }

  log(...args) {
    console.log(
      `${
        new Date().toISOString()} ${
        this.context.padEnd(10)} ${
        args.map(e => e.padEnd(10)).join(' ')}`,
    )
  }
}
