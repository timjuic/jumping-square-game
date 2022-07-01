import Square from './square.js'
import config from './game-config.js'

export default class Level {
   constructor(canvas, levelData) {
      this.canvas = canvas
      this.levelData = levelData
      this.blockSize = this.canvas.height / this.levelData.length
      this.platforms = []
      this.players = []

      this.calculateAssets()
   }

   generate() {
      for (let j = 0; j < this.levelData[0].length; j++) {
         for (let i = 0; i < this.levelData.length; i++) {
            let blockType = this.levelData[i][j]
            if (blockType === '#') {
               var square = new Square(
                  this.blockSize, 
                  'black', 
                  this.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER + this.blockSize * j, 
                  this.blockSize * i
                  )
               this.platforms.push(square)
            } else continue
         }
      }
   }

   draw() {
      this.platforms.forEach(platform => {
         platform.draw()
      })
   }

   nextFrame() {
      this.movedBy += this.gameSpeed
      this.platforms.forEach(platform => {
         platform.position.x -= this.gameSpeed
      })

      this.players.forEach(player => {
         player.tile = Math.floor(Math.abs(this.platforms[0].position.x - this.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER) / this.blockSize)
      })  
   }

   calculateAssets() {
      this.gravity = this.blockSize * config.GRAVITY_MULTIPLIER * config.GLOBAL_GAME_SPEED_MULTIPLIER
      this.gameSpeed = this.blockSize * config.HORIZONTAL_MOVEMENT_SPEED_MULTIPLIER * config.GLOBAL_GAME_SPEED_MULTIPLIER
      this.movedBy = 0
   }

   applyGravity() {
      this.players.forEach(player => {
         let [colliding, velocityToAdd] = this.checkIfPlayerOnGround(player)
         if (!colliding) {
            player.velocity.y += this.gravity
            player.position.y += player.velocity.y

            // If there is spin velocity, apply it 
            if (player.velocity.spin) {
               player.rotation += player.velocity.spin
            }
         } else {
            player.velocity.y = 0
            if (velocityToAdd) player.position.y += velocityToAdd
         }
      })
   }

   checkIfPlayerOnGround(player) {
      let playerPositionIfGravityApplied = player.position.y + player.size + player.velocity.y + this.gravity
      let possibleCollidingPlatforms = this.platforms.filter(platform => platform.tile === player.tile || platform.tile === player.tile + 1)
      let highestPlatformY = Math.min(...possibleCollidingPlatforms.map(p => p.position.y))
      if (!highestPlatformY) highestPlatformY = levelCanvas.height
      if (playerPositionIfGravityApplied <= highestPlatformY) return [false]
      else if (possibleCollidingPlatforms.every(p => player.position.y - player.size > p.position.y)) return [false]
      else return [true, (highestPlatformY - player.position.y - player.size) > 0 ? highestPlatformY - player.position.y - player.size : 0]
   }

   addPlayer(player) {
      this.players.push(player)
   }

   checkIfPlayerDied(player) {
      let possibleCollidingPlatforms = this.platforms.filter(platform => platform.tile === player.tile || platform.tile === player.tile + 1)
      if (this.checkIfColliding(player, possibleCollidingPlatforms)) return true
      else return false
   }

   checkIfColliding(player, possibleCollidingPlatforms) {
      return possibleCollidingPlatforms.some(platform => {
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

   reset() {
      this.platforms = []
      this.movedBy = 0
      this.generate()
   }
}