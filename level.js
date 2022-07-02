import Square from './square.js'
import config from './game-config.js'
import Layer from './layer.js'
import Utils from './utils.js'

export default class Level {
   constructor(canvas, levelData) {
      this.canvas = canvas
      this.mapData = levelData.mapData
      this.blockSize = this.canvas.height / this.mapData.length
      this.platforms = []
      this.players = []
      this.blockImagePaths = levelData.blockImages
      this.blockTypes = Object.keys(levelData.blockImages)
      this.blockImages = {}
      this.backgroundLayers = levelData.backgroundLayers
      this.bgLayers = []
      this.calculateAssets()
   }

   addPlayer(player) {
      this.players.push(player)
   }

   async loadPlatformImgs() {
      for (let blockType of this.blockTypes) {
         let img = await Utils.loadImage(this.blockImagePaths[blockType])
         this.blockImages[blockType] = img
      }
   }

   generatePlatforms() {
      if (Object.keys(this.blockImages).length < this.blockTypes.length) {
         throw new Error('Platform images are not loaded. Make sure to load them first with "loadPlatformImgs()"')
      } 

      for (let j = 0; j < this.mapData[0].length; j++) {
         for (let i = 0; i < this.mapData.length; i++) {
            let blockType = this.mapData[i][j]
            if (blockType === '#') {
               var square = new Square(
                  this.blockSize, 
                  this.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER + this.blockSize * j, 
                  this.blockSize * i,
                  this.blockImages[blockType]
                  )
               this.platforms.push(square)
            } else continue
         }
      }
   }

   drawPlatforms() {
      this.platforms.forEach(platform => {
         if (platform.position.x + platform.size < 0 || platform.position.x > this.canvas.width) return
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

      // Go through possibleCollidingPlatforms and check which one is the player closest to from above
      let closestPlatformY =
         Math.min(...possibleCollidingPlatforms
            .filter(platform => platform.position.y - player.position.y >= 0)
            .map(platform => platform.position.y))
      
      if (playerPositionIfGravityApplied <= closestPlatformY) return [false]
      else if (possibleCollidingPlatforms.every(p => player.position.y - player.size > p.position.y)) return [false]
      else return [true, (closestPlatformY - player.position.y - player.size) > 0 ? closestPlatformY - player.position.y - player.size : 0]
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

   checkIfPlayerFinished(player) {
      if (this.movedBy + player.size >= this.mapData[0].length * this.blockSize) {
         return true
      } else {
         return false
      }
   }

   reset() {
      this.platforms = []
      this.movedBy = 0
      this.generatePlatforms()
   }


   // Methods for working with background
   async loadBackground() {
      for (let layerImgPath of Object.keys(this.backgroundLayers)) {
         let img = await Utils.loadImage(layerImgPath)
         this.bgLayers.push(new Layer(img, this.canvas.width, this.canvas.height, this.backgroundLayers[layerImgPath], this.gameSpeed))
      }
   }

   drawBackground() {
      this.bgLayers.forEach(layer => {
         layer.draw()
      })
   }

   resetBackground() {
      this.bgLayers.forEach(layer => {
         layer.reset()
      })
   }

   nextBackgroundFrame() {
      this.bgLayers.forEach(layer => {
         layer.nextFrame()
      })
   }
}