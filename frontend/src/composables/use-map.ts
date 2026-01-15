import { onMounted } from 'vue'
import { Map } from '@/lib/map'

export function useMap(canvasID: string) {
  const map = new Map()

  function zoomIn() {
    map.zoomIn()
  }

  function zoomOut() {
    map.zoomOut()
  }

  onMounted(() => {
    map.create(canvasID)

    window.addEventListener('resize', () => {
      map.create(canvasID)
    })
  })

  return {
    zoomIn,
    zoomOut,
  }
}
