import env from "../env.js";

class Network {
  constructor(onRec) {
    const ws = new WebSocket(`ws://${env.base}:${env.port}`);
    ws.addEventListener("open", () => console.log("server open"), false);
    ws.addEventListener("message", e => this.recieve(e.data), false);
    ws.addEventListener("error", () => console.log("no server"), false);

    this.ws = ws;
    this.onRec = onRec;
  }

  recieve(data) {
    this.onRec(data);
  }

  send(msg) {
    const { ws } = this;
    ws.send(msg);
  }
}

export default Network;
