import type { GeoProjection } from 'd3-geo'

interface ILayer {
  update: () => void
}

export class Layer implements ILayer {
  private canvas: HTMLCanvasElement | null = null

  private projection: GeoProjection

  constructor(projection: GeoProjection) {
    this.projection = projection
  }

  update() {}
}
