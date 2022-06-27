import Player from './player.js'
import levels from './levels.js'
import Square from './square.js'

window.playerCanvas = document.getElementById('player-canvas')
window.levelCanvas = document.getElementById('level-canvas')
window.ctxPlayer = playerCanvas.getContext('2d')
window.ctxLevel = levelCanvas.getContext('2d')
let canvases = [playerCanvas, levelCanvas]

const ASPECT_RATIO = 16 / 9
const BLOCK_SIZE = 50

// Adjust canvas size when browser window is resized
resizeGame()
window.addEventListener('resize', resizeGame, false)
window.addEventListener('orientationchange', resizeGame, false)


let player1 = new Player('mratko', BLOCK_SIZE, 'brown', 0, 0)
let raf
window.platforms = []


function drawLevel() {
   levels[0].forEach((row, i) => {
      row.forEach((block, j) => {
         if (block === '-') {
            var square = new Square(BLOCK_SIZE, 'white', BLOCK_SIZE * j, BLOCK_SIZE * i)
         } else if (block === '#') {
            var square = new Square(BLOCK_SIZE, 'black', BLOCK_SIZE * j, BLOCK_SIZE * i)
         }
         
         square.draw()
         platforms.push(square)
      })
   })
}
drawLevel()


function gameLoop() {
   ctxPlayer.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
   player1.applyGravity()
   player1.draw()
   raf = requestAnimationFrame(gameLoop)
}

setTimeout(() => {
   gameLoop()
   player1.draw()
}, 4000);




window.addEventListener('keydown', function(e) {
   if (e.code.toLowerCase() === 'arrowup') {
      if (Math.round(player1.position.y + player1.size) !== playerCanvas.height) return
      player1.jump()
   }
})











function resizeGame() {
   let newWidth = window.innerWidth
   let newHeight = window.innerHeight
   let newAspectRatio = newWidth / newHeight

   if (newAspectRatio < ASPECT_RATIO) {
      canvases.forEach(canvas => {
         canvas.width = newWidth
         canvas.height = newWidth / ASPECT_RATIO
      })

   } else {
      canvases.forEach(canvas => {
         canvas.height = newHeight
         canvas.width = newHeight * ASPECT_RATIO
      })
   }
}



