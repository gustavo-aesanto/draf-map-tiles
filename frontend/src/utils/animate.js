import { data } from "../../../server/data/gfs/wind/20260107/00/f000/lev_10_m_above_ground=on.json";

export function windIntensityColorScale(step, maxWindIntensity) {
  const colors = [];
  for (let i = 85; i <= 255; i += step) {
    colors.push(`rgba(255, 255, 255, 1)`);
  }

  colors.indexFor = (intensity) => {
    return Math.floor(
      (Math.min(intensity, maxWindIntensity) / maxWindIntensity) *
        (colors.length - 1)
    );
  };

  return colors;
}


export function init(canvas) {
  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;

  
  const INTENSITY_SCALE_STEP = 10;
  
  const MAX_PARTICLE_AGE = 100;
  const PARTICLE_MULTIPLIER = 7;
  const PARTICLE_LINE_WIDTH = 1;
  const FRAME_RATE = 40; // ms
  
  function conversion(u, v, y) {
    const metersByPixelEquador = 40075000 / width;
    const latitude = (((360 - y) / 4) * Math.PI) / 180;
    const DEGREE_IN_RADIANS_85_94366927 = 1.5;
    let latRad = Math.max(
      -DEGREE_IN_RADIANS_85_94366927,
      Math.min(DEGREE_IN_RADIANS_85_94366927, latitude)
    );
    let cosLat = Math.cos(latRad);

    const deltaX = (u * FRAME_RATE) / (metersByPixelEquador * cosLat);
    const deltaY = (v * FRAME_RATE) / metersByPixelEquador;

    return [deltaX, deltaY];
  }

  function getRandomIntBetween(start, end) {
    return Math.round(Math.random() * (end - start) + start);
  }

  function field() {
    function randomize(o) {
      let x, y;
      do {
        x = Math.round(getRandomIntBetween(0, width));
        y = Math.round(getRandomIntBetween(0, height));
      } while (!isDefined(x, y));
      o.x = x;
      o.y = y;
      return o;
    }

    function create() {
      function getValues(message) {
        return message.find((object) => object.key === "values");
      }

      const u = getValues(data.messages[0]).value;
      const v = getValues(data.messages[1]).value;

      return u.map((value, index) => [
        value,
        v[index],
        Math.sqrt(value ** 2 + v[index] ** 2),
      ]);
    }

    const vectorField = create();

    function get(x, y) {
      const index = (Math.round(y) * width) + Math.round(x);
      const k = Math.round(y) * width + ((Math.round(x) + width / 2) % width);

      return vectorField[k] || [NaN, NaN, null];
    }

    function isDefined(x, y) {
      return get(x, y)[2] !== null;
    }

    return { randomize, get, isDefined };
  }

  const vectorField = field();
  const colorScale = windIntensityColorScale(INTENSITY_SCALE_STEP, 30);
  const buckets = colorScale.map(() => []);

  function animate() {
    const particleCount = Math.round(width * PARTICLE_MULTIPLIER);

    let particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(
        vectorField.randomize({ age: getRandomIntBetween(0, MAX_PARTICLE_AGE) })
      );
    }

    function evolve() {
      buckets.forEach((bucket) => {
        bucket.length = 0;
      });
      particles.forEach((particle) => {
        if (particle.age > MAX_PARTICLE_AGE) {
          vectorField.randomize(particle).age = 0;
        }

        const x = particle.x;
        const y = particle.y;
        const vector = vectorField.get(x, y);

        const uComponent = vector[0];
        const vComponent = vector[1];
        const intensity = vector[2];

        const [deltaX, deltaY] = conversion(uComponent, vComponent, y);

        if (intensity === null) {
          particle.age = MAX_PARTICLE_AGE;
        } else {
          const toX = x + deltaX * 50;
          const toY = y - deltaY * 50;

          if (vectorField.isDefined(toX, toY)) {
            particle.toX = toX;
            particle.toY = toY;
            buckets[colorScale.indexFor(intensity)].push(particle);
          } else {
            particle.x = toX;
            particle.y = toY;
          }
        }

        particle.age += 1;
      });
    }

    ctx.lineWidth = PARTICLE_LINE_WIDTH;
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";

    function draw() {
      let previous = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = previous;

      buckets.forEach((bucket, index) => {
        if (bucket.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = colorScale[index];
          bucket.forEach((particle) => {
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.toX, particle.toY);
            particle.x = particle.toX;
            particle.y = particle.toY;
          });
          ctx.stroke();
        }
      });
    }

    function frame() {
      try {
        evolve();
        draw();
        requestAnimationFrame(frame);
      } catch (e) {
        console.log(e);
      }
    }
    frame();
  }

  animate();
}
