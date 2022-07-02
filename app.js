import Player from './player.js'
import levelsData from './levels-data.js'
import config from './game-config.js'
import Level from './level.js'

window.playerCanvas = document.getElementById('player-canvas')
window.levelCanvas = document.getElementById('level-canvas')
window.ctxPlayer = playerCanvas.getContext('2d')
window.ctxLevel = levelCanvas.getContext('2d')

let guiContainer = document.querySelector('.gui-container')
let htmlGameTitle = document.querySelector('.game-title')
let htmlPlayerNumber = document.querySelector('#player-number')
let htmlLevelNumber = document.querySelector('#level-number')
let playBtn = document.querySelector('.play-btn')

let ticksElapsed = 0
let canvases = [playerCanvas, levelCanvas]
let gamePaused = true
let player1, level
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

   clearCanvases()

   level.bgLayers.forEach(layer => {
      layer.nextFrame()
   })
   level.drawBackground()

   level.nextFrame()
   level.drawPlatforms()


   level.applyGravity(levelsData[levelIndex])
   player1.draw()


   if (level.checkIfPlayerDied(player1)) {
      console.log('died');
      clearCanvases()
      level.reset()
      level.resetBackground()
      level.drawBackground()
      level.drawPlatforms()
      player1.respawn(level.platforms[0].position.y)
      gamePaused = true
      return
   }

   // Checking if level was moved to its end, which means player has won
   if (level.movedBy + player1.size >= levelsData[levelIndex].mapData[0].length * level.blockSize) {
      console.log('You win');
      setTimeout(() => {
         levelIndex++
         generateLevel(levelIndex)
      }, 2000);
      return
   }

   ticksElapsed++

   raf = requestAnimationFrame(gameLoop)
}


async function generateLevel(levelInd) {
   if (levelsData[levelInd] === undefined) return

   level = new Level(levelCanvas, levelsData[levelIndex])
   ticksElapsed = 0
   gamePaused = true
   clearCanvases()
   
   await level.loadPlatformImgs()
   await level.loadBackground()
   level.drawBackground()
   
   level.generatePlatforms()
   level.drawPlatforms()

   player1 = new Player(
      'mratko', 
      level.blockSize, 
      'brown', 
      level.blockSize * config.BLOCK_DISTANCE_FROM_LEFT_BORDER, 
      level.platforms[0].position.y - level.blockSize
      )
      
   level.addPlayer(player1)
   player1.draw()
}

function clearCanvases() {
   ctxPlayer.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
   ctxLevel.clearRect(0, 0, levelCanvas.width, levelCanvas.height)
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
}

function resizeAndRecalculate() {
   resizeGame()

   generateLevel(levelIndex)
}


window.addEventListener('keydown', function (e) {
   if (playerCanvas.style.display === 'none') return

   if (e.code.toLowerCase() === 'arrowup' || e.code.toLowerCase() === 'space') {
      if (gamePaused) {
         gamePaused = false
         gameLoop()
      }
      if (!level.checkIfPlayerOnGround(player1)[0]) return
      player1.jump()
   }
})
