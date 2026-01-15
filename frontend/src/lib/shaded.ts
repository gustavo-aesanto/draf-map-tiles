import { interpolateOranges } from 'd3-scale-chromatic'
import { scaleSequential } from 'd3-scale'

import data from '../../../server/data/gfs/temperature/20251216/00/f000/lev_surface=on.json'

const lowerUpper = [218.554, 327.254]

const scale = scaleSequential().domain(lowerUpper).interpolator(interpolateOranges)

export class Shaded {
  private data
  private width
  private height

  constructor(data: Array<number>, width: number, height: number) {
    this.data = data
    this.width = width
    this.height = height
  }

  public createImage() {
    const pixelsColors: Array<number> = []
    const channels = 4

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = (y * this.width + x) * channels
        const cartesianCorrespondenceOfLatitude = Math.round(y) * this.width
        const cartesianCorrespondenceOfLongitude = Math.round(x)
        const shiftPiLongitude = (cartesianCorrespondenceOfLongitude + this.width / 2) % this.width

        const index = cartesianCorrespondenceOfLatitude + shiftPiLongitude
        const point = this.data[index] || 0

        const RGB = scale(point)
          .slice(4, -1)
          .split(',')
          .map((element) => Number(element)) as [red: number, green: number, green: number]

        pixelsColors[i + 0] = RGB[0]
        pixelsColors[i + 1] = RGB[1]
        pixelsColors[i + 2] = RGB[2]
        pixelsColors[i + 3] = 255
      }
    }

    return new Uint8ClampedArray(pixelsColors)
  }
}
const tmpData = data.data.messages[0].find((element) => element.key == 'values').value

export const temperature = new Shaded(tmpData, 1440, 720).createImage()
