export default (radius = 2) => {
  let w = 0;
  let h = 0;
  let wdir = 1;
  let hdir = 1;
  let x = 0;
  let y = 0;
  const path = [];

  // Spiral pattern
  while (radius--) {
    w++;
    h++;

    // Moving left/up
    for (; x < w * wdir; x += wdir) path.push([x, y]);
    for (; y < h * hdir; y += hdir) path.push([x, y]);
    wdir = wdir * -1;
    hdir = hdir * -1;

    // Moving right/down
    for (; x > w * wdir; x += wdir) path.push([x, y]);
    for (; y > h * hdir; y += hdir) path.push([x, y]);
    wdir = wdir * -1;
    hdir = hdir * -1;
  }
  return path;
};
