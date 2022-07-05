import Square from './square.js'
import config from './game-config.js'
import Layer from './layer.js'
import Utils from './utils.js'
import JumpPlatform from './platforms/jump-platform.js'
import KillPlatform from './platforms/kill-platform.js'

export default class Level {
   constructor(canvas, levelData) {
      this.canvas = canvas
      this.mapData = levelData.mapData
      this.blockSize = this.canvas.height / this.mapData.length
      this.platforms = []
      this.blockImagePaths = levelData.blockImages
      this.blockTypes = Object.keys(levelData.blockImages)
      this.blockImages = {}
      this.backgroundLayers = levelData.backgroundLayers
      this.bgLayers = []
      this.calculateAssets()
   }

   calculateAssets() {
      this.gravity = this.blockSize * config.GRAVITY_MODIFIER * config.GLOBAL_GAME_SPEED_MULTIPLIER
      this.gameSpeed = this.blockSize * config.HORIZONTAL_MOVEMENT_SPEED_MODIFIER * config.GLOBAL_GAME_SPEED_MULTIPLIER
      this.movedBy = 0
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
            if (blockType === '-' || blockType === 'p') continue
            if (blockType  === '#') {
               var platform = new Square(
                  this.blockSize,
                  this.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER + this.blockSize * j,
                  this.blockSize * i,
                  this.blockImages[blockType],
                  blockType
               )
            } else if (blockType === '*') {
               var platform = new JumpPlatform(
                  this.blockSize,
                  this.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER + this.blockSize * j,
                  this.blockSize * i,
                  this.blockImages[blockType],
                  blockType
               )
            } else if (blockType === '!') {
               var platform = new KillPlatform(
                  this.blockSize,
                  this.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER + this.blockSize * j,
                  this.blockSize * i,
                  this.blockImages[blockType],
                  blockType
               )
            }
            this.platforms.push(platform)
         }
      }
   }

   drawPlatforms() {
      this.platforms.forEach(platform => {
         if (platform.position.x + platform.size < 0 || platform.position.x > this.canvas.width) return
         platform.draw()
      })
   }


   // Change this
   updatePlatforms() {
      this.movedBy += this.gameSpeed
      this.platforms.forEach(platform => {
         platform.position.x -= this.gameSpeed
      })

      // This below has to be moved to updatePlayer
      // player.tile = Math.floor(Math.abs(this.platforms[0].position.x - this.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER) / this.blockSize)
   }

   

   // Change this
   // applyGravity(player) {
   //    let [colliding, velocityToAdd] = this.checkIfPlayerOnGround(player)
   //    if (!colliding) {
   //       player.velocity.y += this.gravity
   //       player.position.y += player.velocity.y

   //       // If there is spin velocity, apply it 
   //       if (player.velocity.spin) {
   //          player.rotation += player.velocity.spin
   //          if (player.rotation % 360 === 0) {
   //             player.velocity.spin = 0
   //             player.rotation = 0
   //          }
   //       }
   //    } else {
   //       player.velocity.y = 0
   //       player.onGround = true
   //       if (velocityToAdd) player.position.y += velocityToAdd
   //    }
   // }

   getPlatformsInPlayerTile(playerTile) {
      let platformsInPlayerTile = this.platforms.filter(platform => platform.tile === playerTile || platform.tile === playerTile + 1)
      this.platformsInPlayerTile = platformsInPlayerTile
   }

   // Change this
   // checkIfPlayerOnGround(player) {
   //    let playerPositionIfGravityApplied = player.position.y + player.size + player.velocity.y + this.gravity
   //    let possibleCollidingPlatforms = this.platforms.filter(platform => platform.tile === player.tile || platform.tile === player.tile + 1)

   //    // Go through possibleCollidingPlatforms and check which one is the player closest to from above
   //    let closestPlatformY =
   //       Math.min(...possibleCollidingPlatforms
   //          .filter(platform => platform.position.y - player.position.y >= 0)
   //          .map(platform => platform.position.y))
      
   //    if (playerPositionIfGravityApplied <= closestPlatformY) {
   //       player.onGround = false
   //       return [false]
   //    }
   //    else if (possibleCollidingPlatforms.every(p => player.position.y - player.size > p.position.y)) return [false]
   //    else return [true, (closestPlatformY - player.position.y - player.size) > 0 ? closestPlatformY - player.position.y - player.size : 0]
   // }

   // Change this
   checkIfPlayerDied(player) {
      return this.platformsInPlayerTile.some(platform => {
         if (player.position.y > platform.position.y && player.position.y < platform.position.y + platform.size ||
            player.position.y + player.size > platform.position.y && player.position.y + player.size < platform.position.y + platform.size ||
            player.position.y === platform.position.y && player.position.y + player.size === platform.position.y + platform.size ||
            player.position.y + player.size > canvas.height) {
            return true
         } else {
            return false
         }
      })
   }

   getCurrentPlatform(player) {
      if (!player.onGround) return
      let possiblePlatforms = this.platforms
         .filter(platform => platform.tile === player.tile || platform.tile === player.tile + 1)
         .filter(platform => platform.position.y === player.position.y + player.size)
      
      let currentPlatform, smallestDistance
      for (let i = 0; i < possiblePlatforms.length; i++) {
         let xDistanceFromPlayer = Math.abs(player.position.x - possiblePlatforms[i].position.x)
         if (smallestDistance === undefined || xDistanceFromPlayer < smallestDistance) {
            smallestDistance = xDistanceFromPlayer
            currentPlatform = possiblePlatforms[i]
         }
      }
      return currentPlatform
   }


   checkIfPlayerFinished(player) {
      if (this.movedBy + player.size >= this.mapData[0].length * this.blockSize) {
         return true
      } else {
         return false
      }
   }

   resetPlatforms() {
      this.platforms = []
      this.movedBy = 0
      this.generatePlatforms()
   }

   getPlayerSpawnpointY() {
      let spawnpointY
      this.mapData.forEach((row, rowIndex) => {
         let blockType = row[0]
         if (blockType.toLowerCase() === 'p') {            
            spawnpointY = rowIndex * this.blockSize - 1
         }
      })
      if (spawnpointY) return spawnpointY
      else throw new Error('No player spawnpoint found in the first mapdata column!')
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

   updateBackground() {
      this.bgLayers.forEach(layer => {
         layer.nextFrame()
      })
   }

   reset(player) {
      this.resetPlatforms()
      this.resetBackground()
      this.drawBackground()
      this.drawPlatforms()
      player.respawn(this.getPlayerSpawnpointY())
   }
}