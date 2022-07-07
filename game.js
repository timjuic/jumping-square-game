import config from "./game-config.js"
import { levels as levelsData } from './levels-data.js'
import Level from "./level.js"
import Player from "./player.js"
import Utils from "./utils.js"
import Particle from "./particle.js"
import ParticleHandler from "./particle-handler.js"

export default class Game {
   constructor() {
      this.buffer = document.createElement('canvas').getContext('2d')
      this.canvas = document.createElement('canvas')
      this.ctx = canvas.getContext('2d')
      this.levelIndex
      this.level
      this.player
      this.raf // Request animation frame
      this.paused = true
   }

   start() {
      this.paused = false
      this.loop()
   }

   pause() {
      this.paused = true
   }

   loop() {
      if (this.level === undefined) {
         throw new Error(`Can't start the gameloop, the level is not generated!`)
      }

      if (this.paused) { 
         cancelAnimationFrame(this.raf)
         return
      }

      this.clearCanvas()

      this.level.updateBackground()
      this.level.drawBackground()

      this.level.updatePlatforms()
      this.level.drawPlatforms()

      this.player.getCurrentTile(this.level.platforms)
      this.level.getPlatformsInPlayerTile(this.player.tile)

      let currPlatform = this.level.getCurrentPlatform(this.level.platformsInPlayerTile, this.player)
      if (currPlatform?.type === '*') {
         currPlatform.activate(this.player)
      } else if (currPlatform?.type === '!') {
         this.clearCanvas()
         this.level.reset(this.player)
         this.paused = true
         return
      }

      this.player.update(this.level.platformsInPlayerTile, this.level.gravity)
      this.player.draw()

      if (this.level.checkIfPlayerDied(this.player, this.player.position.x, this.player.position.y)) {
         console.log('died');
         this.player.died = true
         this.paused = true

         // Player death animation
         let chunks = Utils.getImageChunks(this.player.image, this.player.position.x, this.player.position.y, this.player.size, this.player.rotation)
         let particleHandler = new ParticleHandler(this.level.blockSize)
         particleHandler.createExplosionParticles(chunks)

         let particleAnimationFrame
         let animateParticles = () => {
            this.clearCanvas()
            this.level.drawBackground()
            this.level.drawPlatforms()
            particleHandler.updateParticles()
            particleHandler.drawParticles()
            particleAnimationFrame = requestAnimationFrame(animateParticles)
         }
         animateParticles()

         setTimeout(() => {
            cancelAnimationFrame(particleAnimationFrame)
            this.clearCanvas()
            this.level.reset(this.player)
         }, 1000);
         
         return
      }

      // Checking if level was moved to its end, which means player has won
      if (this.level.checkIfPlayerFinished(this.player)) {
         console.log('You win');
         setTimeout(() => {
            this.levelIndex++
            this.generateLevel(this.levelIndex)
         }, 2000);
         return
      }

      this.raf = requestAnimationFrame(this.loop.bind(this))
   }


   async generateLevel(levelIndex) {
      if (levelsData[levelIndex] === undefined) {
         throw new Error(`There is no level with index ${levelIndex}!`)
      }
      this.levelIndex = levelIndex
      this.level = new Level(canvas, levelsData[levelIndex])
      this.paused = true // Game paused when it loads, starts when player presses a button
      this.clearCanvas()

      await this.level.loadPlatformImgs()
      await this.level.loadBackground()
      this.level.drawBackground()

      this.level.generatePlatforms(this.buffer)
      this.level.drawPlatforms()

      this.player = new Player(
         this.level.blockSize,
         './images/player-sprites/8.png',
         this.level.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER,
         this.level.getPlayerSpawnpointY(),
      )

      await this.player.loadSprite()
      this.player.draw()
   }

   clearCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
   }


   resize() {
      console.log('resize called');
      let newWidth = window.innerWidth
      let newHeight = window.innerHeight
      let newAspectRatio = newWidth / newHeight

      if (newAspectRatio < config.ASPECT_RATIO) {
         canvas.width = newWidth
         canvas.height = newWidth / config.ASPECT_RATIO
      } else {
         canvas.height = newHeight
         canvas.width = newHeight * config.ASPECT_RATIO
      }

      if (this.level) {
         // Regenerating the level based on the new screen size
         // This ensures that the game mechanics are the same on all screen sizes
         this.generateLevel(this.levelIndex)
      }  
   }
}