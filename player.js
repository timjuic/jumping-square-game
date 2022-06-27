import Square from './square.js'

const GRAVITY = 0.5
const JUMP_VELOCITY_Y = 10
const JUMP_VELOCITY_SPIN = 10


export default class Player extends Square {
   constructor(name, size, color) {
      super(size)
      this.name = name
      this.velocity = {
         x: 0,
         y: 1,
         spin: 0,
      }
      this.color = color
   }

   draw() {
      window.ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height)
      
      if (this.velocity.spin !== 0) {
         ctx.save()
         ctx.translate(
            this.position.x + this.size / 2,
            this.position.y + this.size / 2
         )
         ctx.rotate(this.rotation * Math.PI/360)
         ctx.translate(
            -(this.position.x + this.size / 2),
            -(this.position.y + this.size / 2)
         )
         window.ctx.fillRect(
            this.position.x,
            this.position.y,
            this.size,
            this.size,
         )
         ctx.restore()
         if (this.rotation % 360 === 0) {
            this.velocity.spin = 0
            this.rotation = 0
         }
      } else {
         
         window.ctx.fillRect(
            this.position.x,
            this.position.y,
            this.size,
            this.size,
         )
      }
      
   }

   applyGravity() {
      if (this.position.y + this.size + this.velocity.y + GRAVITY < gameCanvas.height) {
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