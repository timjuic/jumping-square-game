import Player from './player.js'
import levelsData from './levels-data.js'
import config from './game-config.js'
import Level from './level.js'

window.canvas = document.querySelector('.game-canvas')
window.ctx = window.canvas.getContext('2d')

let guiContainer = document.querySelector('.gui-container')
let htmlGameTitle = document.querySelector('.game-title')
let htmlPlayerNumber = document.querySelector('#player-number')
let htmlLevelNumber = document.querySelector('#level-number')
let playBtn = document.querySelector('.play-btn')

let gamePaused = true
let player1, level
let levelIndex = 0

canvas.style.display = 'none'

playBtn.addEventListener('click', function () {
   levelIndex = htmlLevelNumber.value - 1
   guiContainer.style.display = 'none'
   htmlGameTitle.style.display = 'none'
   canvas.style.display = 'block'

   resizeGame() // scaling the canvas for the current window size
   generateLevel(levelIndex)
})

// Scaling the game to fit current window size
window.addEventListener('resize', resizeAndRecalculate, false)
window.addEventListener('orientationchange', resizeAndRecalculate, false)

let raf


function gameLoop() {
   if (gamePaused) {
      cancelAnimationFrame(raf)
      return
   }

   clearCanvas()

   level.nextBackgroundFrame()
   level.drawBackground()

   level.nextFrame()
   level.drawPlatforms()

   level.applyGravity(player1)
   

   let currPlatform = level.getCurrentPlatform(player1)
   if (currPlatform?.type === '*') {
      currPlatform.activate(player1)
   } else if (currPlatform?.type === '!') {
      clearCanvas()
      level.resetPlatforms()
      level.resetBackground()
      level.drawBackground()
      level.drawPlatforms()
      player1.respawn(level.getPlayerSpawnpointY())
      gamePaused = true
      return
   }

   player1.draw()

   if (level.checkIfPlayerDied(player1)) {
      console.log('died');
      clearCanvas()
      level.resetPlatforms()
      level.resetBackground()
      level.drawBackground()
      level.drawPlatforms()
      player1.respawn(level.getPlayerSpawnpointY())
      gamePaused = true
      return
   }

   // Checking if level was moved to its end, which means player has won
   if (level.checkIfPlayerFinished(player1)) {
      console.log('You win');
      setTimeout(() => {
         levelIndex++
         generateLevel(levelIndex)
      }, 2000);
      return
   }

   raf = requestAnimationFrame(gameLoop)
}


async function generateLevel(levelInd) {
   if (levelsData[levelInd] === undefined) return

   level = new Level(canvas, levelsData[levelIndex])
   gamePaused = true
   clearCanvas()
   
   await level.loadPlatformImgs()
   await level.loadBackground()
   level.drawBackground()
   
   level.generatePlatforms()
   level.drawPlatforms()

   player1 = new Player(
      'mratko',
      level.blockSize,
      './images/player-sprites/8.png',
      level.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER,
      level.getPlayerSpawnpointY(),
   )

   
   level.addPlayer(player1)
   await player1.loadSprite()
   player1.draw()
}

function clearCanvas() {
   ctx.clearRect(0, 0, canvas.width, canvas.height)
}


function resizeGame() {
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
}

function resizeAndRecalculate() {
   resizeGame()

   generateLevel(levelIndex)
}


window.addEventListener('keydown', function (e) {
   player1.jump()
   if (canvas.style.display === 'none') return

   if (e.code.toLowerCase() === 'arrowup' || e.code.toLowerCase() === 'space') {
      if (gamePaused) {
         gamePaused = false
         gameLoop()
      } else {
         if (!level.checkIfPlayerOnGround(player1)[0]) return
         player1.jump()
      }
      
   }
})
