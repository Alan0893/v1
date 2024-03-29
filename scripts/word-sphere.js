/**
 * WordSphere
 * Written by Hyojun Kim in 2017. Licensed in MIT.
 */
function wordSphere(canvas, texts, counts, options) {
  const π = Math.PI; // happy math!

  let canvasWidth, canvasHeight, fontsize, rad;
  // Adjust elements according to device screen size
  if (window.innerWidth <= 350) {
    canvasWidth = 200;
    canvasHeight = 200;
    fontsize = 8;
    rad = 85;
    canvas.style.marginTop = "20px";
    canvas.style.marginBottom = "30px";
  } else if (window.innerWidth <= 480) {
    canvasWidth = 300;
    canvasHeight = 300;
    fontsize = 8;
    rad = 85;
  } else if (window.innerWidth <= 600) {
    canvasWidth = 450;
    canvasHeight = 450;
    fontsize = 12;
    rad = 150;
  } else if (window.innerWidth <= 768) {
    canvasWidth = 425;
    canvasHeight = 425;
    fontsize = 16;
    rad = 165;
  } else if (window.innerWidth <= 1024) {
    canvasWidth = 385;
    canvasHeight = 385;
    fontsize = 12;
    rad = 140;
  } else {
    canvasWidth = 385;
    canvasHeight = 385;
    fontsize = 12;
    rad = 140;
  }

  const {
    width = canvasWidth,
    height = canvasHeight,
    radius = rad,
    fontSize = fontsize,
    tilt = 0,
    initialVelocityX = 0,
    initialVelocityY = 0,
    initialRotationX = 0,
    initialRotationZ = 0,
  } = options;

  let vx = initialVelocityX,
    vy = initialVelocityY;
  let rx = initialRotationX,
    rz = initialRotationZ;

  // canvas setup
  let ctx = canvas.getContext("2d");
  ctx.textAlign = "center";

  // Hi-DPI support
  canvas.width = width * 2;
  canvas.height = height * 2;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(2, 2);

  // scrolling
  let clicked = false,
    lastX,
    lastY;
  canvas.addEventListener("mousedown", (event) => {
    clicked = true;
    lastX = event.screenX;
    lastY = event.screenY;
  });
  canvas.addEventListener("mousemove", (event) => {
    if (!clicked) return;
    [dx, dy] = [event.screenX - lastX, event.screenY - lastY];
    [lastX, lastY] = [event.screenX, event.screenY];

    // rotation update
    rz += -dy * 0.01;
    rx += dx * 0.01;

    // velocity update
    vx = dx * 0.1;
    vy = dy * 0.1;

    if (!looping) startLoop();
  });
  canvas.addEventListener("mouseup", (e) => (clicked = false));
  canvas.addEventListener("mouseleave", (e) => (clicked = false));

  // mobile device touch
  canvas.addEventListener("touchstart", (event) => {
    clicked = true;
    lastX = event.touches[0].screenX;
    lastY = event.touches[0].screenY;
  });
  canvas.addEventListener("touchmove", (event) => {
    if (!clicked) return;
    [dx, dy] = [event.touches[0].screenX - lastX, event.touches[0].screenY - lastY];
    [lastX, lastY] = [event.touches[0].screenX, event.touches[0].screenY];

    // rotation update
    rz += -dy * 0.01;
    rx += dx * 0.01;

    // velocity update
    vx = dx * 0.1;
    vy = dy * 0.1;

    if (!looping) startLoop();
  });
  canvas.addEventListener("touchend", (event) => { clicked = false; });
  canvas.addEventListener("touchcancel", (event) => { clicked = false; });


  function rot(x, y, t) {
    return [
      x * Math.cos(t) - y * Math.sin(t),
      x * Math.sin(t) + y * Math.cos(t),
    ];
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let ix = 0,
      iz = 0,
      i = 1;
    for (const text of texts) {
      const degZ = (π / (counts.length - 1)) * iz;
      const degX = ((2 * π) / counts[iz]) * ix;

      let x = radius * Math.sin(degZ) * Math.cos(degX);
      let y = radius * Math.sin(degZ) * Math.sin(degX);
      let z = radius * Math.cos(degZ) + 8 * (ix % 2); /* randomness */

      // camera transform
      [y, z] = rot(y, z, tilt);
      [x, z] = rot(x, z, rz);
      [x, y] = rot(x, y, rx);

      // convert to cartesian and then draw.
      const alpha = 0.6 + 0.4 * (x / radius);
      const size = fontSize + 2 + 5 * (x / radius);
      if (localStorage.getItem("theme") == "theme-dark") {
        ctx.fillStyle = "rgb(146, 182, 255)";
      } else {
        ctx.fillStyle = "rgb(59, 190, 195)";
      }
      ctx.font = `${size}px "Aspekta"`;
      ctx.fillText(text, y + width / 2, -z + height / 2);

      ix--;
      if (ix < 0) {
        iz++;
        ix = counts[iz] - 1;
      }
      i++;
    }
  }

  // renderer
  let looping = false;
  function rendererLoop() {
    if (looping) window.requestAnimationFrame(rendererLoop);
    render();

    // deacceleration - dirty code xD
    if (vx > 0) vx = vx - 0.01;
    if (vy > 0) vy = vy - 0.01;
    if (vx < 0) vx = vx + 0.01;
    if (vy > 0) vy = vy + 0.01;
    if (vx == 0 && vy == 0) stopLoop();

    rz += vy * 0.01;
    rx += vx * 0.01;
  }

  function startLoop() {
    looping = true;
    window.requestAnimationFrame(rendererLoop);
  }

  function stopLoop() {
    looping = false;
  }
  startLoop();
}

/**
 * 
 */
const canvas = document.getElementById("canvas");

const texts = [
  "HTML5", "CSS", "Javascript", "Java", "Python", 
  "Bash", "Shell", "x86 Assembly", "C", "ReactJS", 
  "Git", "Firebase", "Latex", "NumPy", "CS 112", 
  "CS 131", "CS 210", "CS 132", "Arduino", "Github"
];
const counts = [1, 2, 4, 5, 4, 2, 1];

const options = {
  tilt: Math.PI / 9,
  initialVelocityX: 1,
  initialVelocityY: 1,
  initialRotationX: Math.PI * 0.5,
  initialRotationZ: 0,
};

wordSphere(canvas, texts, counts, options);