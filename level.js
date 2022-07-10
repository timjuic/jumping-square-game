import Square from './square.js'
import config from './game-config.js'
import Layer from './layer.js'
import Utils from './utils.js'
import JumpPlatform from './platforms/jump-platform.js'
import KillPlatform from './platforms/kill-platform.js'
import { platformImagePaths } from './levels-data.js'

export default class Level {
   constructor(canvas, levelData) {
      this.canvas = canvas
      this.mapData = levelData.mapData
      this.platforms = []
      this.blockTypes = Object.keys(platformImagePaths)
      this.platformImages = {}
      this.backgroundLayers = levelData.backgroundLayers
      this.bgLayers = []
      this.calculateAssets()
   }

   calculateAssets() {
      this.blockSize = Math.round(this.canvas.height / this.mapData.length)
      this.gravity = this.blockSize * config.GRAVITY_MODIFIER * config.GLOBAL_GAME_SPEED_MULTIPLIER / refreshRate
      this.gameSpeed = this.blockSize * config.HORIZONTAL_MOVEMENT_SPEED_MODIFIER * config.GLOBAL_GAME_SPEED_MULTIPLIER / refreshRate
      this.movedBy = 0
   }

   async loadPlatformImgs() {
      for (let blockType of Object.keys(platformImagePaths)) {
         let img = await Utils.loadImage(platformImagePaths[blockType])
         this.platformImages[blockType] = img
      }
   }

   generatePlatforms() {
      if (Object.keys(this.platformImages).length < Object.keys(platformImagePaths).length) {
         throw new Error('Platform images are not loaded. Make sure to load them first with "loadPlatformImgs()"')
      } 

      bufferCanvas.width = this.mapData[0].length * this.blockSize
      bufferCanvas.height = canvas.height

      for (let j = 0; j < this.mapData[0].length; j++) {
         for (let i = 0; i < this.mapData.length; i++) {
            let blockType = this.mapData[i][j]
            if (blockType === '-' || blockType === 'p') continue
            if (blockType  === '#') {
               var platform = new Square(
                  this.blockSize,
                  this.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER + this.blockSize * j,
                  this.blockSize * i,
                  this.platformImages[blockType],
                  blockType
               )
            } else if (blockType === '*') {
               var platform = new JumpPlatform(
                  this.blockSize,
                  this.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER + this.blockSize * j,
                  this.blockSize * i,
                  this.platformImages[blockType],
                  blockType
               )
            } else if (blockType === '!') {
               var platform = new KillPlatform(
                  this.blockSize,
                  this.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER + this.blockSize * j,
                  this.blockSize * i,
                  this.platformImages[blockType],
                  blockType
               )
            }
            this.platforms.push(platform)
            
         }
      }
   }

   preRenderPlatforms() {
      this.platforms.forEach(platform => {
         bufferCtx.drawImage(platform.image, platform.position.x, platform.position.y, platform.size, platform.size)
      })
   }

   drawPlatforms() {
      // Platforms are now prerendered on offscreen canvas, they are drawn with only this 1 draw call instead of the one commented below
      ctx.drawImage(bufferCtx.canvas, this.movedBy, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)

      // this.platforms.forEach(platform => {
      //    platform.draw()
      // })
   }

   updatePlatforms() {
      this.movedBy += this.gameSpeed
      // this.platforms.forEach(platform => {
      //    platform.position.x -= this.gameSpeed
      // })
   }

   

   getPlatformsInPlayerTile(playerTile) {
      let platformsInPlayerTile = this.platforms.filter(platform => platform.tile === playerTile || platform.tile === playerTile + 1)
      this.platformsInPlayerTile = platformsInPlayerTile
   }


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

   getCurrentPlatform(platformsInPlayerTile, player) {
      if (player.state !== 'sliding') return
      let possiblePlatforms = platformsInPlayerTile
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
      if (this.movedBy + this.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER + this.blockSize >= this.mapData[0].length * this.blockSize) {
         return true
      } else {
         return false
      }
   }

   getPlayerSpawnpointY() {
      let spawnpointY
      this.mapData.forEach((row, rowIndex) => {
         let blockType = row[0]
         if (blockType.toLowerCase() === 'p') {            
            spawnpointY = rowIndex * this.blockSize
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
         layer.update()
      })
   }

   reset(player) {
      this.movedBy = 0
      this.resetBackground()
      this.drawBackground()
      this.drawPlatforms()
      player.respawn(this.getPlayerSpawnpointY())
   }
}