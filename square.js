
import config from './game-config.js'

export default class Square {
   constructor(size, color, posX, posY) {
      this.size = size
      this.position = {
         x: posX,
         y: posY,
      }
      this.color = color
      this.tile = (posX - config.PLAYER_POSITION_X) / config.BLOCK_SIZE
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