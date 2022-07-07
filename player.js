import Square from './square.js'
import config from './game-config.js'
import Utils from './utils.js'

export default class Player extends Square {
   constructor(size, imagePath, posX, posY) {
      super(size, posX, Math.floor(posY))
      this.velocity = {
         x: 0,
         y: 0,
         spin: 0,
      }
      this.imagePath = imagePath
      this.rotation = 0
      this.rotateBy = 0
      this.jumpVelocity = size * config.JUMP_VELOCITY_MODIFIER * config.GLOBAL_GAME_SPEED_MULTIPLIER
      this.image
      this.states = ['sliding', 'jumping', 'falling']
      this.state = this.states[0]
      this.fallRotated = false
      this.died = false
      this.deaths = 0
   }

   async loadSprite() {
      this.image = await Utils.loadImage(this.imagePath)
   }

   draw() {
      if (this.rotation !== 0) {
         ctx.save()
         ctx.translate(
            this.position.x + this.size / 2,
            this.position.y + this.size / 2
         )
         ctx.rotate(this.rotation * Math.PI / 180)
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

   getCurrentTile(levelMovedBy) {
      this.tile = Math.floor(Math.abs(levelMovedBy) / this.size)
   }

   update(platformsInPlayerTile, gravity) {
      let platformsBelowPlayer = platformsInPlayerTile.filter(platform => platform.position.y >= this.position.y + this.size)
      let highestY = Math.min(...(platformsBelowPlayer.map(platform => platform.position.y)))
      
      if (this.position.y + this.size < highestY) { // If player is above platforms, apply gravity
         this.velocity.y += gravity
         if (this.state !== 'jumping') {
            this.state = this.states[2]
         }
      }

      if (this.velocity.y) this.position.y = Math.round(this.position.y + this.velocity.y) // Updating player y position

      // If player position goes lower than the platform, set it back on top
      if (this.position.y + this.size > highestY) {
         // Inside here we know that player is on ground (on platform)
         this.position.y = Math.round(highestY - this.size)
         this.velocity.y = 0
         this.state = this.states[0]
         this.fallRotated = false
      }


      // Player rotation when sliding off a platform 
      // this.fallRotated is a helper variable which makes sure players spins only once for 90 deg
      if (this.state === 'falling' && !this.fallRotated) {
         this.rotateBy = config.PLAYER_SLIDEOFF_ROTATION
         this.velocity.spin = config.JUMP_SPIN_VELOCITY
         this.fallRotated = true
      }

      // Rotating the player
         if (this.rotateBy > 0) {
            this.rotation += this.velocity.spin
            this.rotateBy -= this.velocity.spin
         } else {
            this.velocity.spin = 0
            this.rotateBy = 0
         }
         
         // Making sure player rotation doesnt go to infinity
         if (this.rotation >= 360) this.rotation = 0
   }

   jump() {
      this.velocity.y = -this.jumpVelocity
      this.velocity.spin = config.JUMP_SPIN_VELOCITY
      this.rotateBy = (this.rotateBy + config.PLAYER_JUMP_ROTATION) > 360 ? 
         (this.rotateBy + config.PLAYER_JUMP_ROTATION) % 360 : 
         (this.rotateBy + config.PLAYER_JUMP_ROTATION)
      this.state = this.states[1]
   }

   respawn(spawnpointY) {
      this.position.x = Math.round(this.size * config.BLOCK_DISTANCE_FROM_LEFT_BORDER)
      this.position.y = Math.round(spawnpointY)
      this.velocity.spin = 0
      this.velocity.y = 0
      this.rotation = 0
      this.rotateBy = 0
      this.state = this.states[0]
      this.fallRotated = false
      this.died = false
      this.draw()
   }
}





