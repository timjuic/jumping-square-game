import Player from './player.js'
import Square from './square.js'
import levels from './levels.js'
import config from './game-config.js'

window.playerCanvas = document.getElementById('player-canvas')
window.levelCanvas = document.getElementById('level-canvas')
window.ctxPlayer = playerCanvas.getContext('2d')
window.ctxLevel = levelCanvas.getContext('2d')
window.platforms = []
window.levelMovedBy = 0
let ticksElapsed = 0
let canvases = [playerCanvas, levelCanvas]
let gameRunning = false
let blockSize, gameSpeed, gravity, jumpVelocity
let player1

resizeGame()
window.addEventListener('resize', resizeGame, false)
window.addEventListener('orientationchange', resizeGame, false)

let raf


drawLevel()


function gameLoop() {
   ctxPlayer.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
   player1.applyGravity(levels[0])
   player1.draw()
   ctxLevel.clearRect(0, 0, levelCanvas.width, levelCanvas.height)

   drawNextLevelFrame()

   if (player1.checkIfDied()) {
      console.log('died');
      return
   }

   // Checking if level was moved to its end, which means player has won
   if (levelMovedBy + player1.size >= levels[0][0].length * blockSize) {
      console.log('You win');
      return
   }

   // Getting distance for which platforms have been moved and dividing by blocksize to get the tile player is in currently
   player1.tile = Math.floor(Math.abs(platforms[0].position.x - blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER) / blockSize)
   ticksElapsed++
   raf = requestAnimationFrame(gameLoop)
}


function drawNextLevelFrame() {
   levelMovedBy += gameSpeed
   platforms.forEach(platform => {
      platform.position.x -= gameSpeed
      platform.draw()
   })
}



function drawLevel() {
   console.log('drawing level');

   player1 = new Player('mratko', blockSize, 'brown', blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER, 0, jumpVelocity, gravity)
   player1.draw()

   // Going through the level data by columns, so the level is drawn from left to right
   window.platforms = []
   for (let j = 0; j < levels[0][0].length; j++) {
      for (let i = 0; i < levels[0].length; i++) {
         let blockType = levels[0][i][j]
         if (blockType === '#') {
            var square = new Square(blockSize, 'black', levelMovedBy + blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER + blockSize * j, blockSize * i)
            platforms.push(square)
         } else continue
         
         square.draw()
      }
   }
}



function resizeGame() {
   let newWidth = window.innerWidth
   let newHeight = window.innerHeight
   let newAspectRatio = newWidth / newHeight

   if (newAspectRatio < config.ASPECT_RATIO) {
      canvases.forEach(canvas => {
         canvas.width = newWidth
         canvas.height = newWidth / config.ASPECT_RATIO
      })

   } else {
      canvases.forEach(canvas => {
         canvas.height = newHeight
         canvas.width = newHeight * config.ASPECT_RATIO
      })
   }

   // Calculating game elements size depending on the canvas height and number of level rows
   blockSize = Math.floor(playerCanvas.height / levels[0].length)
   // Multiplying game config depending on the element size so the gamespeed / gravity is the same no matter the screen size
   gravity = blockSize * config.GRAVITY_MULTIPLIER
   jumpVelocity = blockSize * config.JUMP_VELOCITY_MULTIPLIER
   gameSpeed = blockSize * config.GAME_SPEED_MULTIPLIER
   levelMovedBy = config.GAME_SPEED_MULTIPLIER * ticksElapsed

   // Redrawing the game after resize
   drawLevel()
}



window.addEventListener('keydown', function(e) {
   if (e.code.toLowerCase() === 'arrowup') {
      if (!gameRunning) {
         gameRunning = true
         gameLoop()
      }
      else {
         if (!player1.checkForCollision()[0]) return
         player1.jump()
      }
   }
})