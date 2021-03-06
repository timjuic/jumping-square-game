
import config from './game-config.js'

export default class Square {
   constructor(size, posX, posY, image, type) {
      this.size = size
      this.position = {
         x: posX,
         y: posY,
      }
      this.image = image
      this.type = type
      // all squares have the same size so "size" variable can be used below
      this.tile = Math.round((posX - size * config.BLOCK_DISTANCE_FROM_LEFT_BORDER) / size)
   }

   draw() {
      ctx.drawImage(
         this.image,
         this.position.x,
         this.position.y,
         this.size,
         this.size,
      )
   }
}