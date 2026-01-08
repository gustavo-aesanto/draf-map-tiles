import { getRandomIntBetween } from "./get-random-number.js";

interface WindInterface {
  create(zonal: Array<number>, meridional: Array<number>): void;
  startAnimation(): void;
  stopAnimation(): void;
  isRunningAnimation: boolean;
}

type WindVector = [zonal: number, meridional: number, intensity: number | null];
type Particle = {
  x: number;
  y: number;
  age: number;
};

// PARTICLE SETTINGS
const MAX_PARTICLE_AGE = 100;
const PARTICLE_MULTIPLIER = 7;
const PARTICLE_LINE_WIDTH = 1;
const FRAME_RATE = 40; // in milliseconds
const NULL_WIND_VECTOR = [NaN, NaN, null];

const INTENSITY_SCALE_STEP = 10;

// CARTOGRAPHIC CONSTANTS
const EARTH_EQUATORIAL_PERIMETER = 40075000; // in meters

export class Wind implements WindInterface {
  public isRunningAnimation = true;

  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;

  private field: Array<WindVector>;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");

    this.width = canvas.width;
    this.height = canvas.height;
  }

  /**
   * @function create(zonal,meridional)
   * The `create` takes an array of zonal(horizontal) components and an array of meridional(vertical) components
   * than create a wind vector field which type is `Array<zonal, meridional, intensity>`.
   */
  public create(zonal: Array<number>, meridional: Array<number>) {
    const vectorFieldSize = zonal.length || meridional.length;

    for (let i = 0; i < vectorFieldSize; i++) {
      const zonalComponent = zonal[i];
      const meridionalComponent = meridional[i];
      const intensity = Math.sqrt(
        zonalComponent ** 2 + meridionalComponent ** 2
      );

      this.field.push([zonalComponent, meridionalComponent, intensity]);
    }
  }

  /**
   * @function get(x,y)
   * The `get` takes a (x, y) coordinate and return a correspondent wind vector in the field.
   * If there's not vector correspondent to the coordinate, then return the null vector
   * which is `[NaN, NaN, null]`.
   */
  private get(x: number, y: number) {
    const cartesianCorrespondenceOfLatitude = Math.round(y) * this.width;
    const cartesianCorrespondenceOfLongitude = Math.round(x);
    const shiftPiLongitude =
      (cartesianCorrespondenceOfLongitude + this.width / 2) % this.width;

    const index = cartesianCorrespondenceOfLatitude + shiftPiLongitude;
    return this.field[index] || NULL_WIND_VECTOR;
  }

  /**
   * @function isDefined(x,y)
   * The `isDefined` takes a (x,y) coordinate and return a boolean value that indicate if a wind vector
   * exists in that coordinate.
   */
  private isDefined(x: number, y: number) {
    return this.get(x, y)[2] !== null;
  }

  /**
   * @function randomize(particle)
   * The `randomize` takes a particle then generate a random position for it and returns the particle.
   */
  private randomize(particle: Particle) {
    let x: number, y: number;
    do {
      x = Math.round(getRandomIntBetween(0, this.width));
      y = Math.round(getRandomIntBetween(0, this.height));
    } while (!this.isDefined(x, y));
    particle.x = x;
    particle.y = y;
    return particle;
  }

  private measureDisplacement(zonal: number, meridional: number, y: number) {
    const metersByPixelEquador = EARTH_EQUATORIAL_PERIMETER / this.width;
    const radian = Math.PI / 180

    const latitude = ((360 - y) / 4) * radian;
    const latitudeLimit = 1.5; // 85.94366927 degrees (Arbitrary value)
    let latRad = Math.max(
      -latitudeLimit,
      Math.min(latitudeLimit, latitude)
    );
    const cosLat = Math.cos(latRad);

    const deltaX = (zonal * FRAME_RATE) / (metersByPixelEquador * cosLat);
    const deltaY = (meridional * FRAME_RATE) / metersByPixelEquador;

    return [deltaX, deltaY];
  }

  public startAnimation() {}

  public stopAnimation() {}
}
