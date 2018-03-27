import env from "../env.js";

export default () => {
  const ws = new WebSocket(`ws://${env.base}:${env.port}`);
  ws.addEventListener("open", () => console.log("open"), false);
  ws.addEventListener("message", e => console.log(e.data), false);
  ws.addEventListener("error", () => console.log("nope"), false);
};
