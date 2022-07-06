import Game from './game.js'

window.canvas = document.querySelector('.game-canvas')
window.ctx = window.canvas.getContext('2d')

let guiContainer = document.querySelector('.gui-container')
let htmlGameTitle = document.querySelector('.game-title')
let htmlLevelNumber = document.querySelector('#level-number')
let playBtn = document.querySelector('.play-btn')

let levelIndex = 0
let game

canvas.style.display = 'none'

playBtn.addEventListener('click', async function () {
   levelIndex = htmlLevelNumber.value - 1
   guiContainer.style.display = 'none'
   htmlGameTitle.style.display = 'none'
   canvas.style.display = 'block'

   game = new Game()

   game.resize() // Initially resizing game to fit window size
   await game.generateLevel(levelIndex)


   window.addEventListener('resize', game.resize.bind(game), false)
   window.addEventListener('orientationchange', game.resize.bind(game), false)


   window.addEventListener('keydown', function (e) {
      if (canvas.style.display === 'none' || game.player.died) return

      if (e.code.toLowerCase() === 'arrowup' || e.code.toLowerCase() === 'space') {
         if (game.paused) {
            game.paused = false
            game.start()
         } else {
            if (game.player.state !== 'sliding') return
            game.player.jump()
         }
      }
   })


})