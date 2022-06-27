import Square from './square.js'

const GRAVITY = 0.5
const JUMP_VELOCITY_Y = 10
const JUMP_VELOCITY_SPIN = 10


export default class Player extends Square {
   constructor(name, size, color, posX, posY) {
      super(size, color, posX, posY)
      this.name = name
      this.velocity = {
         x: 0,
         y: 1,
         spin: 0,
      }
      this.color = color
   }

   draw() {
      ctxPlayer.fillStyle = this.color
      ctxPlayer.clearRect(0, 0, playerCanvas.width, playerCanvas.height)
      
      if (this.velocity.spin !== 0) {
         ctxPlayer.save()
         ctxPlayer.translate(
            this.position.x + this.size / 2,
            this.position.y + this.size / 2
         )
         ctxPlayer.rotate(this.rotation * Math.PI/360)
         ctxPlayer.translate(
            -(this.position.x + this.size / 2),
            -(this.position.y + this.size / 2)
         )
         ctxPlayer.fillRect(
            this.position.x,
            this.position.y,
            this.size,
            this.size,
         )
         ctxPlayer.restore()
         if (this.rotation % 360 === 0) {
            this.velocity.spin = 0
            this.rotation = 0
         }
      } else {
         
         ctxPlayer.fillRect(
            this.position.x,
            this.position.y,
            this.size,
            this.size,
         )
      }
      
   }

   applyGravity() {
      if (this.position.y + this.size + this.velocity.y + GRAVITY < playerCanvas.height) {
         this.velocity.y += GRAVITY
         this.position.y += this.velocity.y

         if (this.velocity.spin) {
            this.rotation += this.velocity.spin
         }
      } else {
         this.velocity.y = 0
      }
   }

   jump() {
      this.velocity.y = -JUMP_VELOCITY_Y
      this.velocity.spin = JUMP_VELOCITY_SPIN
   }
}