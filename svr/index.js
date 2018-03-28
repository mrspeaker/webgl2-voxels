const WebSocketServer = require("ws").Server;
const port = 40401;
const wss = new WebSocketServer({ port });

const makePlayer = () => ({
  pos: [0, 0, 0],
  acc: [],
  vel: [],
  w: 0.6,
  h: 1.7,
  speed: 6
});

async function go() {
  const state = await loadState();
  console.log(state);
  tick(state);

  console.log("loaded, awaiting connections on port", port);
  wss.on("connection", ws => {
    console.log("connected");
    const p = makePlayer();
    p.ws = ws;
    state.players.push(p);

    ws.on("message", msg => {
      //console.log("received: %s", msg);
      if (msg === "w") {
        p.pos[2] -= 0.1;
      }
    });
  });
}

go();

function tick(state) {
  state.players.forEach(p => {
    const {ws, pos} = p;
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(pos));
    }
  });
  setTimeout(() => tick(state), 1000);
}

async function loadState() {
  return Promise.resolve({
    players: []
  });
}
