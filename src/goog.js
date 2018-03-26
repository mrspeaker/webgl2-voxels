const ping = (cat, act, label) => {
  if (!window.ga) return;
  window.ga("send", {
    hitType: "event",
    eventCategory: cat,
    eventAction: act,
    eventLabel: label
  });
};

export default {
  lookBook() {
    ping("Ad", "book", "looky-booky");
  },
  newWorld() {
    ping("Game", "world", "new-world");
  },
  noWebGL2() {
    ping("Browser", "support", "no-webgl2");
  }
};
