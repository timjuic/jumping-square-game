import Player from './player.js'

window.gameCanvas = document.getElementById('game-canvas')
window.ctx = gameCanvas.getContext('2d')

const ASPECT_RATIO = 16 / 9
const BLOCK_SIZE = 30 // 30 pixels



// Adjust canvas size when browser window is resized
resizeGame()
window.addEventListener('resize', resizeGame, false)
window.addEventListener('orientationchange', resizeGame, false)


let player1 = new Player('mratko', 50, 'brown')
let raf

function gameLoop() {
  
   player1.applyGravity()
   player1.draw()
   raf = requestAnimationFrame(gameLoop)
}
gameLoop()
player1.draw()


window.addEventListener('keydown', function(e) {
   if (e.code.toLowerCase() === 'arrowup') {
      console.log('triggered');
      if (Math.round(player1.position.y + player1.size) !== gameCanvas.height) return
      player1.jump()
   }
})















function resizeGame() {
   let newWidth = window.innerWidth
   let newHeight = window.innerHeight
   let newAspectRatio = newWidth / newHeight

   if (newAspectRatio < ASPECT_RATIO) {
      gameCanvas.width = newWidth
      gameCanvas.height = newWidth / ASPECT_RATIO
   } else {
      gameCanvas.height = newHeight
      gameCanvas.width = newHeight * ASPECT_RATIO
   }
}



