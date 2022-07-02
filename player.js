import Square from './square.js'
import config from './game-config.js'
import Utils from './utils.js'

export default class Player extends Square {
   constructor(name, size, imagePath, posX, posY) {
      super(size, posX, posY)
      this.name = name
      this.velocity = {
         x: 0,
         y: 1,
         spin: 0,
      }
      this.imagePath = imagePath
      this.rotation = 0
      this.jumpVelocity = size * config.JUMP_VELOCITY_MODIFIER * config.GLOBAL_GAME_SPEED_MULTIPLIER
      this.image
      this.onGround = true
   }

   async loadSprite() {
      this.image = await Utils.loadImage(this.imagePath)
   }

   draw() {
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
         ctxPlayer.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.size,
            this.size,
         )
         ctxPlayer.restore()
      } else {

         ctxPlayer.drawImage(
            this.image,
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
      this.onGround = false
   }

   respawn(spawnpointY) {
      this.position.x = this.size * config.BLOCK_DISTANCE_FROM_LEFT_BORDER
      this.position.y = spawnpointY
      this.rotation = 0
      this.onGround = true
      this.draw()
   }
}





