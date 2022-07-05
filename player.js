import Square from './square.js'
import config from './game-config.js'
import Utils from './utils.js'

export default class Player extends Square {
   constructor(size, imagePath, posX, posY) {
      super(size, posX, posY)
      this.velocity = {
         x: 0,
         y: 0,
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
         ctx.save()
         ctx.translate(
            this.position.x + this.size / 2,
            this.position.y + this.size / 2
         )
         ctx.rotate(this.rotation * Math.PI / 360)
         ctx.translate(
            -(this.position.x + this.size / 2),
            -(this.position.y + this.size / 2)
         )
         ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.size,
            this.size,
         )
         ctx.restore()
      } else {

         ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.size,
            this.size,
         )
      }
   }

   getCurrentTile(platforms) {
      this.tile = Math.floor(Math.abs(platforms[0].position.x - this.size * config.BLOCK_DISTANCE_FROM_LEFT_BORDER) / this.size)
   }

   update(platformsInPlayerTile, gravity) {
      let platformsBelowPlayer = platformsInPlayerTile.filter(platform => platform.position.y >= this.position.y + this.size)
      let highestY = Math.min(...(platformsBelowPlayer.map(platform => platform.position.y)))
      
      if (this.position.y + this.size < highestY) { // If player is above, apply gravity
         this.velocity.y += gravity
         this.onGround = false
      }

      if (this.velocity.y) this.position.y += this.velocity.y // Updating player position

      // If player position goes lower than the platform, set it back on top
      if (this.position.y + this.size > highestY) {
         this.position.y = highestY - this.size
         this.velocity.y = 0
         this.onGround = true
      }

   }

   jump() {
      this.velocity.y = -this.jumpVelocity
      this.velocity.spin = config.JUMP_SPIN_VELOCITY
   }

   respawn(spawnpointY) {
      this.position.x = this.size * config.BLOCK_DISTANCE_FROM_LEFT_BORDER
      this.position.y = spawnpointY
      this.rotation = 0
      this.onGround = true
      this.draw()
   }
}





