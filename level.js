import Square from './square.js'
import config from './game-config.js'
import Layer from './layer.js'

export default class Level {
   constructor(canvas, levelData) {
      this.canvas = canvas
      this.mapData = levelData.mapData
      this.blockSize = this.canvas.height / this.mapData.length
      this.platforms = []
      this.players = []

      this.calculateAssets()

      this.bg = {
         path: levelData.backgroundImage
      }

   }

   generatePlatforms() {
      for (let j = 0; j < this.mapData[0].length; j++) {
         for (let i = 0; i < this.mapData.length; i++) {
            let blockType = this.mapData[i][j]
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

   drawPlatforms() {
      this.platforms.forEach(platform => {
         platform.draw()
      })
   }

   async loadBackground() {
      async function LoadImage(src) {
         return await new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = src
         })
      }
      let img = await LoadImage(this.bg.path)
      this.bg = new Layer(img, this.canvas.width, this.canvas.height, 0.2, this.gameSpeed)
   }

   drawBackground() {
      this.bg.draw()
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
      console.log(possibleCollidingPlatforms);

      // Go through possibleCollidingPlatforms and check which one is the player closest to from above
      let closestPlatformY =
         Math.min(...possibleCollidingPlatforms
            .filter(platform => platform.position.y - player.position.y >= 0)
            .map(platform => platform.position.y))
      
      if (playerPositionIfGravityApplied <= closestPlatformY) return [false]
      else if (possibleCollidingPlatforms.every(p => player.position.y - player.size > p.position.y)) return [false]
      else return [true, (closestPlatformY - player.position.y - player.size) > 0 ? closestPlatformY - player.position.y - player.size : 0]
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
      this.generatePlatforms()
   }
}