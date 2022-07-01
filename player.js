import Square from './square.js'
import config from './game-config.js'

export default class Player extends Square {
   constructor(name, size, color, posX, posY, jumpVel, gravity) {
      super(size, color, posX, posY)
      this.name = name
      this.velocity = {
         x: 0,
         y: 1,
         spin: 0,
      }
      this.color = color
      this.rotation = 0
      this.jumpVelocity = jumpVel
      this.gravity = gravity
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

   applyGravity() {
      let [colliding, velocityToAdd] = this.checkIfOnGround()
      if (!colliding) {
         this.velocity.y += this.gravity
         this.position.y += this.velocity.y

         // If there is spin velocity, apply it 
         if (this.velocity.spin) {
            this.rotation += this.velocity.spin
         }
      } else {
         this.velocity.y = 0
         if (velocityToAdd) this.position.y += velocityToAdd
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


   checkIfOnGround() {
      let playerPositionIfGravityApplied = this.position.y + this.size + this.velocity.y + this.gravity
      let possibleCollidingPlatforms = platforms.filter(platform => platform.tile === this.tile || platform.tile === this.tile + 1)
      let highestPlatformY = Math.min(...possibleCollidingPlatforms.map(p => p.position.y))
      if (!highestPlatformY) highestPlatformY = levelCanvas.height
      if (playerPositionIfGravityApplied <= highestPlatformY) return [false]
      else if (possibleCollidingPlatforms.every(p => this.position.y - this.size > p.position.y)) return [false]
      else return [true, (highestPlatformY - this.position.y - this.size) > 0 ? highestPlatformY - this.position.y - this.size : 0]
   }


   checkIfDied() {
      let possibleCollidingPlatforms = platforms.filter(platform => platform.tile === this.tile || platform.tile === this.tile + 1)
      if (this.checkIfColliding(this, possibleCollidingPlatforms)) return true
      else return false
   }

   checkIfColliding(player, platforms) {
      return platforms.some(platform => {
         if (player.position.y > platform.position.y && player.position.y < platform.position.y + platform.size ||
            player.position.y + player.size > platform.position.y && player.position.y + player.size < platform.position.y + platform.size ||
            player.position.y === platform.position.y && player.position.y + player.size === platform.position.y + platform.size ||
            player.position.y + player.size > playerCanvas.height) {
            return true
         } else {
            return false
         }
      })
   }
}





