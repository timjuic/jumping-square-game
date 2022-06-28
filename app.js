import Player from './player.js'
import levels from './levels.js'
import Square from './square.js'
import config from './game-config.js'

window.playerCanvas = document.getElementById('player-canvas')
window.levelCanvas = document.getElementById('level-canvas')
window.ctxPlayer = playerCanvas.getContext('2d')
window.ctxLevel = levelCanvas.getContext('2d')
let canvases = [playerCanvas, levelCanvas]


// Adjust canvas size when browser window is resized
resizeGame()
window.addEventListener('resize', resizeGame, false)
window.addEventListener('orientationchange', resizeGame, false)


let player1 = new Player('mratko', config.BLOCK_SIZE, 'brown', config.PLAYER_POSITION_X, 0)
let raf
window.platforms = []

drawLevel()


function gameLoop() {
   ctxPlayer.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
   player1.applyGravity(levels[0])
   player1.draw()

   ctxLevel.clearRect(0, 0, levelCanvas.width, levelCanvas.height)

   platforms.forEach(platform => {
      platform.position.x -= config.GAME_SPEED
      platform.draw()
   })

   if (player1.checkIfDied()) {
      console.log('died');
      return
   }
   // Getting distance for which platforms have been moved and dividing by blocksize to get the tile player is in currently
   player1.tile = Math.floor(Math.abs(platforms[0].position.x - config.PLAYER_POSITION_X) / config.BLOCK_SIZE)

   raf = requestAnimationFrame(gameLoop)
}

setTimeout(() => {
   gameLoop()
   player1.draw()
}, 1000);




function drawLevel() {
   // Going through the level data columns first
   for (let j = 0; j < levels[0][0].length; j++) {
      for (let i = 0; i < levels[0].length; i++) {
         let blockType = levels[0][i][j]
         if (blockType === '#') {
            var square = new Square(config.BLOCK_SIZE, 'black', config.PLAYER_POSITION_X + config.BLOCK_SIZE * j, config.BLOCK_SIZE * i)
            platforms.push(square)
         } else continue
         
         square.draw()
      }
   }

}


window.addEventListener('keydown', function(e) {
   if (e.code.toLowerCase() === 'arrowup') {
      if (!player1.checkForCollision()[0]) return
      player1.jump()
   }
})







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



