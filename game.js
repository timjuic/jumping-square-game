import config from "./game-config.js"
import { levels as levelsData } from './levels-data.js'
import Level from "./level.js"
import Player from "./player.js"
import Utils from "./utils.js"
import ParticleHandler from "./particle-handler.js"

export default class Game {
   constructor() {
      window.bufferCanvas = document.createElement('canvas')
      window.bufferCtx = bufferCanvas.getContext('2d')
      window.canvas = document.createElement('canvas')
      window.ctx = canvas.getContext('2d')
      canvas.classList.add('game-canvas')
      document.body.appendChild(canvas)
      console.log(canvas);
      this.levelIndex
      this.level
      this.player
      this.raf
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

      if (this.paused) return

      this.clearCanvas()

      this.level.updateBackground()
      this.level.drawBackground()

      this.level.updatePlatforms()
      this.level.drawPlatforms()

      this.player.getCurrentTile(this.level.movedBy)
      this.level.getPlatformsInPlayerTile(this.player.tile)

      let currPlatform = this.level.getCurrentPlatform(this.level.platformsInPlayerTile, this.player)
      if (currPlatform?.type === '*') {
         currPlatform.activate(this.player)
      } else if (currPlatform?.type === '!') {
         this.player.died = true
         this.player.deaths++
         this.pause()
         this.showDeathAnimation()
         this.resetLevel()
         return
      }

      this.player.update(this.level.platformsInPlayerTile, this.level.gravity)
      this.player.draw()

      this.displayLevelNumber()
      this.displayDeaths()

      if (this.level.checkIfPlayerDied(this.player, this.player.position.x, this.player.position.y)) {
         console.log('died');
         this.player.died = true
         this.player.deaths++
         this.pause()

         // Player death animation
         this.showDeathAnimation()
         this.resetLevel()
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
      this.pause() // Game paused when it loads, starts when player presses a button
      this.clearCanvas()

      await this.level.loadPlatformImgs()
      await this.level.loadBackground()
      this.level.drawBackground()

      this.level.generatePlatforms()

      // Prerendering all platforms to offscreen canvas for performance reasons
      // Offscreen canvas contents are then moved as the game moves
      // This way we dont need to update every individual platform on every tick
      this.level.preRenderPlatforms()
      this.level.drawPlatforms()

      this.player = new Player(
         this.level.blockSize,
         './images/player-sprites/11.png',
         this.level.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER,
         this.level.getPlayerSpawnpointY(),
      )

      await this.player.loadSprite()
      this.player.draw()

      this.displayLevelNumber()
      this.displayDeaths()
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
         canvas.height =  newWidth / config.ASPECT_RATIO
      } else {
         canvas.height = newHeight
         canvas.width = newHeight * config.ASPECT_RATIO
      }

      if (this.level) { // ensuring level is loaded
         // Regenerating the level based on the new screen size
         // This ensures that the game mechanics are the same on all screen sizes
         this.generateLevel(this.levelIndex)
      }  
   }

   displayLevelNumber() {
      ctx.font = '20px serif'
      ctx.fillStyle = 'black'
      ctx.fillText(`Level: ${this.levelIndex + 1}`, 50, 50)
   }

   displayDeaths() {
      ctx.font = '20px serif'
      ctx.fillStyle = 'black'
      ctx.fillText(`Deaths: ${this.player.deaths}`, 50, 80)
   }   

   showDeathAnimation() {
      let chunks = Utils.getImageChunks(this.player.image, this.player.position.x, this.player.position.y, this.player.size, this.player.rotation)
      let particleHandler = new ParticleHandler(this.level.blockSize)
      particleHandler.createExplosionParticles(chunks)

      let animateParticles = () => {
         console.log('animating');
         this.clearCanvas()
         this.level.drawBackground()
         this.level.drawPlatforms()
         particleHandler.updateParticles()
         particleHandler.drawParticles()
         this.displayLevelNumber()
         this.displayDeaths()
         this.particleAnimationFrame = requestAnimationFrame(animateParticles)
      }
      animateParticles()
   }

   resetLevel() {
      setTimeout(() => {
         cancelAnimationFrame(this.particleAnimationFrame)
         this.clearCanvas()
         this.level.reset(this.player)
         this.displayLevelNumber()
         this.displayDeaths()
      }, 1000);
   }
}