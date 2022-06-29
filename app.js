import Player from './player.js'
import levels from './levels.js'
import Square from './square.js'
import config from './game-config.js'

window.playerCanvas = document.getElementById('player-canvas')
window.levelCanvas = document.getElementById('level-canvas')
window.ctxPlayer = playerCanvas.getContext('2d')
window.ctxLevel = levelCanvas.getContext('2d')
window.platforms = []
window.levelMovedBy = 0
let ticksElapsed = 0
let canvases = [playerCanvas, levelCanvas]
let resizing = false
let blockSize, gameSpeed, gravity, jumpVelocity

resizeGame()
window.addEventListener('resize', resizeGame, false)
window.addEventListener('orientationchange', resizeGame, false)

config.PLAYER_POSITION_X = blockSize * 2


// TODO
// CREATE NEW PLAYER INSTANCE AFTER RESIZING,
// THE CURRENT PROBLEM IS THAT IM CHANGING CONFIG VALUES, I SHOULD JSUT MAKE NEW VARIABLES

// Adjust canvas size when browser window is resized


var player1 = new Player('mratko', blockSize, 'brown', config.PLAYER_POSITION_X, 0, jumpVelocity, gravity)
let raf


drawLevel()


function gameLoop() {
   if (resizing) return
   console.log('running');
   ctxPlayer.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
   player1.applyGravity(levels[0])
   player1.draw()
   ctxLevel.clearRect(0, 0, levelCanvas.width, levelCanvas.height)

   drawNextLevelFrame()

   if (player1.checkIfDied()) {
      console.log('died');
      return
   }

   if (levelMovedBy + player1.size >= levels[0][0].length * blockSize) {
      console.log('You win');
      return
   }

   // Getting distance for which platforms have been moved and dividing by blocksize to get the tile player is in currently
   player1.tile = Math.floor(Math.abs(platforms[0].position.x - config.PLAYER_POSITION_X) / blockSize)
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

setTimeout(() => {
   gameLoop()
   player1.draw()
}, 100);




function drawLevel() {
   console.log('drawing level');

   player1 = new Player('mratko', blockSize, 'brown', config.PLAYER_POSITION_X, 0, jumpVelocity, gravity)

   // Going through the level data by columns, so the level is drawn from left to right
   window.platforms = []
   for (let j = 0; j < levels[0][0].length; j++) {
      for (let i = 0; i < levels[0].length; i++) {
         let blockType = levels[0][i][j]
         if (blockType === '#') {
            console.log('posX', levelMovedBy, config.PLAYER_POSITION_X, blockSize * j);
            var square = new Square(blockSize, 'black', levelMovedBy + config.PLAYER_POSITION_X + blockSize * j, blockSize * i)
            platforms.push(square)
         } else continue
         
         square.draw()
      }
   }
}



function resizeGame() {
   resizing = true
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
   config.PLAYER_POSITION_X = blockSize * 2
   levelMovedBy = config.GAME_SPEED_MULTIPLIER * ticksElapsed
   console.log(blockSize, gravity, jumpVelocity, gameSpeed);

   // Redrawing the game after resize
   drawLevel()
   resizing = false
}



window.addEventListener('keydown', function(e) {
   if (e.code.toLowerCase() === 'arrowup') {
      if (!player1.checkForCollision()[0]) return
      player1.jump()
   }
})