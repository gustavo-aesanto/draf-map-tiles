import { geoEquirectangular, geoGraticule, geoPath, type GeoPath, type GeoProjection } from 'd3-geo'
import geojson from '@/data/110m_land.json'
import '@/lib/shaded'
import { temperature } from '@/lib/shaded'

const MAX_ZOOM = 2500
const MIN_ZOOM = 229
const ZOOM_STEPPER = 15

export class Map {
  private canvas: HTMLCanvasElement | null = null
  private context: CanvasRenderingContext2D | null = null
  private width = 0
  private height = 0
  private projection: GeoProjection | null = null
  private geoPath: GeoPath
  private bounds = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  }

  private layers = []

  constructor() {
    this.geoPath = geoPath()
  }

  public create(canvasID: string) {
    this.canvas = document.querySelector(canvasID)
    if (!this.canvas) throw new Error('The canvas specified is not available.')

    this.width = window.innerWidth
    this.height = window.innerHeight

    this.canvas.width = this.width
    this.canvas.height = this.height
    this.context = this.canvas.getContext('2d')

    this.projection = geoEquirectangular()

    this.setBounds()

    this.update()

    this.canvas.addEventListener('wheel', (event) => {
      if (event.deltaY > 0) this.zoomIn()
      else this.zoomOut()
    })

    this.canvas.addEventListener('dragstart', (event) => {
      console.log(event)
    })
  }

  private setBounds() {
    const geoGenerator = this.geoPath.projection(this.projection).context(this.context)

    const bounds = geoGenerator.bounds(geojson)
    const leftTopCorner = bounds[0]
    const rightBottomCorner = bounds[1]

    this.bounds.startX = leftTopCorner[0]
    this.bounds.endX = rightBottomCorner[0]
    this.bounds.startY = leftTopCorner[1]
    this.bounds.endY = rightBottomCorner[1]
  }

  private update({ scale } = { scale: MIN_ZOOM }) {
    if (this.context) {
      const geoGenerator = this.geoPath.projection(this.projection).context(this.context)
      if (this.projection) this.projection.scale(scale).translate([this.width / 2, this.height / 2])

      this.context.fillStyle = 'black'
      this.context.fillRect(0, 0, this.width, this.height)

      this.setBounds()

      const newWidth = this.bounds.endX - this.bounds.startX
      const newHeight = this.bounds.endY - this.bounds.startY
      console.log({ width: newWidth, height: newHeight })

      const overlay = new ImageData(temperature, 1440, 720)
      this.context.putImageData(overlay, this.bounds.startX - 1, this.bounds.startY - 25)

      this.createGraticule(geoGenerator)
      this.createBorders(geoGenerator)
    }
  }

  private createGraticule(geoGenerator: GeoPath) {
    const graticule = geoGraticule()
    if (this.context) {
      this.context.beginPath()
      this.context.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      geoGenerator(graticule())
      this.context.stroke()
    }
  }

  private createBorders(geoGenerator: GeoPath) {
    if (this.context) {
      this.context.lineWidth = 0.5
      this.context.strokeStyle = '#fff'
      this.context.beginPath()
      geoGenerator(geojson)

      this.context.stroke()
    }
  }

  public zoomIn() {
    if (this.projection) {
      const scale = this.projection.scale()

      if (scale < MAX_ZOOM) this.update({ scale: scale + ZOOM_STEPPER })
    }
  }

  public zoomOut() {
    if (this.projection) {
      const scale = this.projection.scale()

      if (scale > MIN_ZOOM) this.update({ scale: scale - ZOOM_STEPPER })
    }
  }

  public drag() {}
}
