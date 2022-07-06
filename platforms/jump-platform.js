import Square from '../square.js'
import config from '../game-config.js'

export default class JumpPlatform extends Square {
   constructor(size, posX, posY, image, type) {
      super(size, posX, posY, image, type)
   }

   activate(player) {
      console.log('activate called');
      player.velocity.y = -player.jumpVelocity * config.PLATFORM_JUMP_MULTIPLIER
      player.velocity.spin = 15
      player.rotateBy = 360
      player.state = player.states[1]
   }
}