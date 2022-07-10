import Game from './game.js'
import Utils from './Utils.js'
import { levels as levelsData } from './levels-data.js'

let guiContainer = document.querySelector('.gui-container')
let htmlGameTitle = document.querySelector('.game-title')
let htmlLevelNumber = document.querySelector('#level-number')
let playBtn = document.querySelector('.play-btn')

let levelIndex = 0
let game

for (let i = 0; i < levelsData.length; i++) {
   let option = document.createElement('option')
   option.value = i + 1;
   option.innerHTML = `Level ${i + 1}`
   htmlLevelNumber.append(option)
}

async function getDisplayRefreshRate() {
   let framesToCheck = 10
   let frames = 0
   let lastTimestamp
   let frameDelays = []
   return await new Promise(resolve => {
      frame()
      function frame(timestamp) {
         frameDelays.push(timestamp - lastTimestamp)

         frames++
         lastTimestamp = timestamp
         if (frames < framesToCheck) requestAnimationFrame(frame)
         else return resolve(Utils.getMode(frameDelays.map(delay => Math.round(1000 / delay))))
      }
   })
}

getDisplayRefreshRate().then(refreshRate => {
   
   window.refreshRate = refreshRate
   console.log(refreshRate);

   playBtn.addEventListener('click', async function () {
      levelIndex = htmlLevelNumber.value - 1
      guiContainer.style.display = 'none'
      htmlGameTitle.style.display = 'none'
   
      game = new Game()
      game.resize() // Initially resizing game to fit window size
      await game.generateLevel(levelIndex)
   
      window.addEventListener('resize', game.resize.bind(game), false)
      window.addEventListener('orientationchange', game.resize.bind(game), false)
   
      let listenForEvents = ['keydown', 'mousedown']
      listenForEvents.forEach(eventName => {
         window.addEventListener(eventName, function (e) {
            if (canvas.style.display === 'none' || game.player.died) return
      
            if (e.code?.toLowerCase() === 'arrowup' || e.code?.toLowerCase() === 'space' || e.button === 0) {
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
   })
}) 

