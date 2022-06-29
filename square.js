
import config from './game-config.js'

export default class Square {
   constructor(size, color, posX, posY) {
      this.size = size
      this.position = {
         x: posX,
         y: posY,
      }
      this.color = color
      // all squares have the same size so "size" variable can be used below
      this.tile = Math.floor((posX - size * config.BLOCK_DISTANCE_FROM_LEFT_BORDER) / size)
   }

   draw() {
      ctxLevel.fillStyle = this.color
         
      ctxLevel.fillRect(
         this.position.x,
         this.position.y,
         this.size,
         this.size,
      )
   }
}