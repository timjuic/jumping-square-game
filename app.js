import Player from './player.js'
import Square from './square.js'
import levels from './levels-data.js'
import config from './game-config.js'

window.playerCanvas = document.getElementById('player-canvas')
window.levelCanvas = document.getElementById('level-canvas')
window.ctxPlayer = playerCanvas.getContext('2d')
window.ctxLevel = levelCanvas.getContext('2d')

let guiContainer = document.querySelector('.gui-container')
let htmlGameTitle = document.querySelector('.game-title')
let htmlPlayerNumber = document.querySelector('#player-number')
let htmlLevelNumber = document.querySelector('#level-number')
let playBtn = document.querySelector('.play-btn')

window.platforms = []
window.levelMovedBy = 0
let ticksElapsed = 0
let canvases = [playerCanvas, levelCanvas]
let gamePaused = true
let blockSize, gameSpeed, gravity, jumpVelocity
let player1
let levelIndex = 0, playersNum

canvases.forEach(canvas => {
   canvas.style.display = 'none'
})

playBtn.addEventListener('click', function () {
   playersNum = htmlPlayerNumber.value
   levelIndex = htmlLevelNumber.value - 1
   guiContainer.style.display = 'none'
   htmlGameTitle.style.display = 'none'
   canvases.forEach(canvas => {
      canvas.style.display = 'block'
   })
   resizeGame()
})

// Scaling the game to fit current window size

window.addEventListener('resize', resizeGame, false)
window.addEventListener('orientationchange', resizeGame, false)

let raf


function gameLoop() {

   if (gamePaused) {
      cancelAnimationFrame(raf)
      return
   }

   clearCanvases()

   player1.applyGravity(levels[levelIndex])
   player1.draw()

   drawNextLevelFrame()

   if (player1.checkIfDied()) {
      console.log('died');
      player1.respawn(platforms)

      return
   }

   // Checking if level was moved to its end, which means player has won
   if (levelMovedBy + player1.size >= levels[levelIndex][0].length * blockSize) {
      console.log('You win');
      setTimeout(() => {
         generateNextLevel()
      }, 2000);
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

function generateNextLevel() {
   if (levels[levelIndex + 1] === undefined) return
   levelIndex++
   ticksElapsed = 0
   levelMovedBy = 0
   gamePaused = true
   clearCanvases()
   calculateLevelAssets()
   drawLevel()
}

function clearCanvases() {
   ctxPlayer.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
   ctxLevel.clearRect(0, 0, levelCanvas.width, levelCanvas.height)
}


function drawLevel() {
   console.log('drawing level');

   // Going through the level data by columns, so the level is drawn from left to right
   window.platforms = []
   blockSize = Math.floor(playerCanvas.height / levels[levelIndex].length)

   for (let j = 0; j < levels[levelIndex][0].length; j++) {
      for (let i = 0; i < levels[levelIndex].length; i++) {
         let blockType = levels[levelIndex][i][j]
         if (blockType === '#') {
            var square = new Square(blockSize, 'black', blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER + blockSize * j - levelMovedBy, blockSize * i)
            platforms.push(square)
         } else continue

         square.draw()
      }
   }

   player1 = new Player('mratko', blockSize, 'brown', blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER, platforms[0].position.y - blockSize, jumpVelocity, gravity)
   player1.draw()
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

   calculateLevelAssets()

   levelMovedBy = 0

   gamePaused = true // Pausing the game

   drawLevel() // Redrawing the game after resize
}

function calculateLevelAssets() {
   // Calculating game elements size depending on the canvas height and number of level rows
   blockSize = Math.floor(playerCanvas.height / levels[levelIndex].length)
   // Multiplying game config depending on the element size so the gamespeed / gravity is the same no matter the screen size
   gravity = blockSize * config.GRAVITY_MULTIPLIER * config.GLOBAL_GAME_SPEED_MULTIPLIER
   jumpVelocity = blockSize * config.JUMP_VELOCITY_MULTIPLIER * config.GLOBAL_GAME_SPEED_MULTIPLIER
   gameSpeed = blockSize * config.HORIZONTAL_MOVEMENT_SPEED_MULTIPLIER * config.GLOBAL_GAME_SPEED_MULTIPLIER
}


window.addEventListener('keydown', function (e) {
   if (playerCanvas.style.display === 'none') return

   if (e.code.toLowerCase() === 'arrowup' || e.code.toLowerCase() === 'space') {
      if (gamePaused) {
         gamePaused = false
         gameLoop()
      }
      if (!player1.checkIfOnGround()[0]) return
      player1.jump()
   }
})
