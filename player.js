import Square from './square.js'
import config from './game-config.js'

export default class Player extends Square {
   constructor(name, size, color, posX, posY) {
      super(size, color, posX, posY)
      this.name = name
      this.velocity = {
         x: 0,
         y: 1,
         spin: 0,
      }
      this.color = color
      this.rotation = 0
      this.jumpVelocity = size * config.JUMP_VELOCITY_MULTIPLIER * config.GLOBAL_GAME_SPEED_MULTIPLIER
   }

   draw() {
      ctxPlayer.fillStyle = this.color
      ctxPlayer.clearRect(0, 0, playerCanvas.width, playerCanvas.height)

      if (this.velocity.spin !== 0) {
         ctxPlayer.save()
         ctxPlayer.translate(
            this.position.x + this.size / 2,
            this.position.y + this.size / 2
         )
         ctxPlayer.rotate(this.rotation * Math.PI / 360)
         ctxPlayer.translate(
            -(this.position.x + this.size / 2),
            -(this.position.y + this.size / 2)
         )
         ctxPlayer.fillRect(
            this.position.x,
            this.position.y,
            this.size,
            this.size,
         )
         ctxPlayer.restore()
         if (this.rotation % 360 === 0) {
            this.velocity.spin = 0
            this.rotation = 0
         }
      } else {

         ctxPlayer.fillRect(
            this.position.x,
            this.position.y,
            this.size,
            this.size,
         )
      }
   }

   jump() {
      this.velocity.y = -this.jumpVelocity
      this.velocity.spin = config.JUMP_SPIN_VELOCITY
   }

   respawn(platforms) {
      this.position.x = this.size * config.BLOCK_DISTANCE_FROM_LEFT_BORDER
      this.position.y = platforms[0].position.y - this.size
      this.draw()
   }
}





