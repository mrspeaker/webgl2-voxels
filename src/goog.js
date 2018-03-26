const ping = (cat, act = "") => {
  if (!window.ga) return;
  window.ga("send", {
    hitType: "event",
    eventCategory: cat,
    eventAction: act
  });
};

export default {
  lookBook() {
    ping("Ad", "looky-booky");
  },
  newWorld() {
    ping("Game", "new-world");
  },
  noWebGL2() {
    ping("Browser", "no-webgl2");
  }
};
