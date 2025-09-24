// happy birtday.js
// Replace the whole file with this version to make the greeting responsive.

const c = document.getElementById("c");
const ctx = c.getContext("2d");

let w, h, hw, hh;
let dpr = window.devicePixelRatio || 1;

// Options (strings kept the same)
const opts = {
  strings: ["Happy 20th", "Birthday to you", "bebi! I Love You!"],
  // charSize / charSpacing / lineHeight will be set dynamically by updateSizes()
  charSize: 30,
  charSpacing: 35,
  lineHeight: 40,

  cx: 0,
  cy: 0,

  fireworkPrevPoints: 10,
  fireworkBaseLineWidth: 5,
  fireworkAddedLineWidth: 8,
  fireworkSpawnTime: 200,
  fireworkBaseReachTime: 30,
  fireworkAddedReachTime: 30,
  fireworkCircleBaseSize: 20,
  fireworkCircleAddedSize: 10,
  fireworkCircleBaseTime: 30,
  fireworkCircleAddedTime: 30,
  fireworkCircleFadeBaseTime: 10,
  fireworkCircleFadeAddedTime: 5,
  fireworkBaseShards: 5,
  fireworkAddedShards: 5,
  fireworkShardPrevPoints: 3,
  fireworkShardBaseVel: 4,
  fireworkShardAddedVel: 2,
  fireworkShardBaseSize: 3,
  fireworkShardAddedSize: 3,
  gravity: 0.1,
  upFlow: -0.1,
  letterContemplatingWaitTime: 360,
  balloonSpawnTime: 20,
  balloonBaseInflateTime: 10,
  balloonAddedInflateTime: 10,
  balloonBaseSize: 20,
  balloonAddedSize: 20,
  balloonBaseVel: 0.4,
  balloonAddedVel: 0.4,
  balloonBaseRadian: -(Math.PI / 2 - 0.5),
  balloonAddedRadian: -1,
};

const calc = {
  totalWidth: 0,
};

const Tau = Math.PI * 2;
const TauQuarter = Tau / 4;

let letters = [];

/* ---------- Letter & Shard classes (same logic as before) ---------- */

function Letter(char, x, y) {
  this.char = char;
  this.x = x;
  this.y = y;

  // dx/dy will be calculated after ctx.font is set
  this.dx = 0;
  this.dy = 0;

  this.fireworkDy = this.y - hh;

  this.reset();
}
Letter.prototype.reset = function () {
  this.phase = "firework";
  this.tick = 0;
  this.spawned = false;
  this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
  this.reachTime =
    (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) |
    0;
  this.lineWidth =
    opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
  this.prevPoints = [[0, hh, 0]];

  // After font is set, measure text to center it well
  this.dx = -ctx.measureText(this.char).width / 2;
  this.dy = +opts.charSize / 2;

  var hue = (this.x / calc.totalWidth) * 360;
  this.color = "hsl(hue,80%,50%)".replace("hue", hue);
  this.lightAlphaColor = "hsla(hue,80%,light%,alp)".replace("hue", hue);
  this.lightColor = "hsl(hue,80%,light%)".replace("hue", hue);
  this.alphaColor = "hsla(hue,80%,50%,alp)".replace("hue", hue);
};

Letter.prototype.step = function () {
  if (this.phase === "firework") {
    if (!this.spawned) {
      ++this.tick;
      if (this.tick >= this.spawningTime) {
        this.tick = 0;
        this.spawned = true;
      }
    } else {
      ++this.tick;

      var linearProportion = this.tick / this.reachTime,
        armonicProportion = Math.sin(linearProportion * TauQuarter),
        x = linearProportion * this.x,
        y = hh + armonicProportion * this.fireworkDy;

      if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();

      this.prevPoints.push([x, y, linearProportion * this.lineWidth]);

      var lineWidthProportion = 1 / (this.prevPoints.length - 1);

      for (var i = 1; i < this.prevPoints.length; ++i) {
        var point = this.prevPoints[i],
          point2 = this.prevPoints[i - 1];

        ctx.strokeStyle = this.alphaColor.replace("alp", i / this.prevPoints.length);
        ctx.lineWidth = point[2] * lineWidthProportion * i;
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
      }

      if (this.tick >= this.reachTime) {
        this.phase = "contemplate";

        this.circleFinalSize =
          opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
        this.circleCompleteTime =
          (opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random()) |
          0;
        this.circleCreating = true;
        this.circleFading = false;

        this.circleFadeTime =
          (opts.fireworkCircleFadeBaseTime +
            opts.fireworkCircleFadeAddedTime * Math.random()) |
          0;
        this.tick = 0;
        this.tick2 = 0;

        this.shards = [];

        var shardCount =
            (opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random()) | 0,
          angle = Tau / shardCount,
          cos = Math.cos(angle),
          sin = Math.sin(angle),
          x = 1,
          y = 0;

        for (var i = 0; i < shardCount; ++i) {
          var x1 = x;
          x = x * cos - y * sin;
          y = y * cos + x1 * sin;

          this.shards.push(new Shard(this.x, this.y, x, y, this.alphaColor));
        }
      }
    }
  } else if (this.phase === "contemplate") {
    ++this.tick;

    if (this.circleCreating) {
      ++this.tick2;
      var proportion = this.tick2 / this.circleCompleteTime,
        armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor
        .replace("light", 50 + 50 * proportion)
        .replace("alp", proportion);
      ctx.beginPath();
      ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
      ctx.fill();

      if (this.tick2 > this.circleCompleteTime) {
        this.tick2 = 0;
        this.circleCreating = false;
        this.circleFading = true;
      }
    } else if (this.circleFading) {
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      ++this.tick2;
      var proportion = this.tick2 / this.circleFadeTime,
        armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor
        .replace("light", 100)
        .replace("alp", 1 - armonic);
      ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
      ctx.fill();

      if (this.tick2 >= this.circleFadeTime) this.circleFading = false;
    } else {
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
    }

    for (var i = 0; i < this.shards.length; ++i) {
      this.shards[i].step();

      if (!this.shards[i].alive) {
        this.shards.splice(i, 1);
        --i;
      }
    }

    if (this.tick > opts.letterContemplatingWaitTime) {
      this.phase = "balloon";

      this.tick = 0;
      this.spawning = true;
      this.spawnTime = (opts.balloonSpawnTime * Math.random()) | 0;
      this.inflating = false;
      this.inflateTime =
        (opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random()) |
        0;
      this.size = (opts.balloonBaseSize + opts.balloonAddedSize * Math.random()) | 0;

      var rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
        vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();

      this.vx = Math.cos(rad) * vel;
      this.vy = Math.sin(rad) * vel;
    }
  } else if (this.phase === "balloon") {
    ctx.strokeStyle = this.lightColor.replace("light", 80);

    if (this.spawning) {
      ++this.tick;
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      if (this.tick >= this.spawnTime) {
        this.tick = 0;
        this.spawning = false;
        this.inflating = true;
      }
    } else if (this.inflating) {
      ++this.tick;

      var proportion = this.tick / this.inflateTime,
        x = (this.cx = this.x),
        y = (this.cy = this.y - this.size * proportion);

      ctx.fillStyle = this.alphaColor.replace("alp", proportion);
      ctx.beginPath();
      generateBalloonPath(x, y, this.size * proportion);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, this.y);
      ctx.stroke();

      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      if (this.tick >= this.inflateTime) {
        this.tick = 0;
        this.inflating = false;
      }
    } else {
      this.cx += this.vx;
      this.cy += this.vy += opts.upFlow;

      ctx.fillStyle = this.color;
      ctx.beginPath();
      generateBalloonPath(this.cx, this.cy, this.size);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.lineTo(this.cx, this.cy + this.size);
      ctx.stroke();

      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);

      if (this.cy + this.size < -hh || this.cx < -hw || this.cy > hw) this.phase = "done";
    }
  }
};

function Shard(x, y, vx, vy, color) {
  var vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();

  this.vx = vx * vel;
  this.vy = vy * vel;

  this.x = x;
  this.y = y;

  this.prevPoints = [[x, y]];
  this.color = color;

  this.alive = true;

  this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
}
Shard.prototype.step = function () {
  this.x += this.vx;
  this.y += this.vy += opts.gravity;

  if (this.prevPoints.length > opts.fireworkShardPrevPoints) this.prevPoints.shift();

  this.prevPoints.push([this.x, this.y]);

  var lineWidthProportion = this.size / this.prevPoints.length;

  for (var k = 0; k < this.prevPoints.length - 1; ++k) {
    var point = this.prevPoints[k],
      point2 = this.prevPoints[k + 1];

    ctx.strokeStyle = this.color.replace("alp", k / this.prevPoints.length);
    ctx.lineWidth = k * lineWidthProportion;
    ctx.beginPath();
    ctx.moveTo(point[0], point[1]);
    ctx.lineTo(point2[0], point2[1]);
    ctx.stroke();
  }

  if (this.prevPoints[0][1] > hh) this.alive = false;
};

function generateBalloonPath(x, y, size) {
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size / 4, y - size, x, y - size);
  ctx.bezierCurveTo(x + size / 4, y - size, x + size / 2, y - size / 2, x, y);
}

/* ---------- Responsive sizing & letter creation ---------- */

function updateSizesAndText() {
  // physical CSS pixels
  w = Math.max(300, window.innerWidth);
  h = Math.max(300, window.innerHeight);

  dpr = window.devicePixelRatio || 1;

  // Set canvas size for crisp rendering
  c.style.width = w + "px";
  c.style.height = h + "px";
  c.width = Math.floor(w * dpr);
  c.height = Math.floor(h * dpr);

  // scale the drawing context so CSS pixels map correctly
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  hw = w / 2;
  hh = h / 2;

  // Compute sizes so text fits within ~85% of canvas width
  const desiredWidth = w * 0.85;

  // longest string length (characters)
  const maxChars = Math.max(...opts.strings.map((s) => s.length, 0), 1);

  // charSpacing = available space per char (center-to-center)
  let charSpacing = desiredWidth / Math.max(1, maxChars);

  // charSize slightly smaller than spacing so characters don't overflow
  let charSize = Math.floor(charSpacing * 0.78);

  // clamp charSize to practical ranges
  const minCharSize = 12;
  const maxCharSize = Math.max(28, Math.round(Math.min(w / 10, 48)));
  charSize = Math.max(minCharSize, Math.min(charSize, maxCharSize));

  opts.charSize = charSize;
  opts.charSpacing = Math.max(14, Math.floor(charSpacing));
  opts.lineHeight = Math.max(charSize * 1.05, Math.floor(charSize * 1.2));

  // set font now so measureText works correctly
  ctx.font = "bold " + opts.charSize + "px 'Comic Sans MS', cursive";

  // update calc width using the longest line (in spacing units)
  calc.totalWidth =
    opts.charSpacing *
    Math.max(...opts.strings.map((s) => s.length, 0), 1);

  // recreate letters with new sizing
  createLetters();
}

function createLetters() {
  letters.length = 0;

  for (let i = 0; i < opts.strings.length; ++i) {
    const str = opts.strings[i];
    const rowLen = str.length;
    for (let j = 0; j < rowLen; ++j) {
      const x =
        j * opts.charSpacing +
        opts.charSpacing / 2 -
        (rowLen * opts.charSpacing) / 2;
      const y =
        i * opts.lineHeight +
        opts.lineHeight / 2 -
        (opts.strings.length * opts.lineHeight) / 2;
      const L = new Letter(str[j], x, y);
      // dx/dy will be recalculated in reset (we already set ctx.font)
      L.reset();
      letters.push(L);
    }
  }
}

/* ---------- Animation loop ---------- */

function anim() {
  window.requestAnimationFrame(anim);

  // background
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(hw, hh);

  var done = true;
  for (var l = 0; l < letters.length; ++l) {
    letters[l].step();
    if (letters[l].phase !== "done") done = false;
  }

  ctx.restore();

  if (done) {
    for (var l = 0; l < letters.length; ++l) letters[l].reset();
  }
}

/* ---------- Music controls (keeps existing behavior) ---------- */

let isPlaying = false;
const audio = document.getElementById("birthdaySong");
const musicBtn = document.getElementById("musicBtn");

audio.volume = 1.0;
audio.muted = false;

function toggleMusic() {
  if (isPlaying) {
    audio.pause();
    musicBtn.innerHTML = "🎵 Play Music";
    isPlaying = false;
  } else {
    audio
      .play()
      .then(() => {
        musicBtn.innerHTML = "🔇 Pause Music";
        isPlaying = true;
      })
      .catch((e) => {
        console.log("Audio play failed:", e);
        alert("Please click to enable audio - browsers require user interaction to play sounds!");
      });
  }
}

// Optional: start on first click anywhere (keeps previous behavior)
let firstClick = false;
document.body.addEventListener("click", () => {
  if (!firstClick) {
    audio.play().then(() => {
      musicBtn.innerHTML = "🔇 Pause Music";
      isPlaying = true;
    }).catch(e => {
      console.log("Audio play prevented or failed:", e);
    });
    firstClick = true;
  }
});

/* ---------- Resize handling ---------- */

window.addEventListener("resize", function () {
  updateSizesAndText();
});

// initial setup and start
updateSizesAndText();
anim();

/* ---------- Message popup (card) functions - leave as is if you already use them ---------- */

function showMessage() {
  const box = document.getElementById("messageBox");
  if (box) box.style.display = "block";
}
function closeMessage() {
  const box = document.getElementById("messageBox");
  if (box) box.style.display = "none";
}
