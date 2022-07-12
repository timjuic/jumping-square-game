import Particle from "./particle.js";

export default class ParticleHandler {
   constructor(blockSize, gravity) {
      this.particles = []
      this.levelBlockSize = blockSize
      this.gravity = gravity / 2
   }

   createExplosionParticles(chunks) {
      chunks.forEach(chunk => {
         let velXDirection = Math.floor(Math.random() * 2) === 0 ? -1 : 1
         let velXMultiplier = Math.floor(Math.random() * 30)
         let velX = velXDirection * Math.floor(Math.random() * velXMultiplier)
         let velYDirection = Math.floor(Math.random() * 2) === 0 ? -1 : 1
         let velYMultiplier = Math.floor(Math.random() * 30)
         let velY = velYDirection * Math.floor(Math.random() * velYMultiplier)

         // Recalculating particle size and velocity based on window size
         let size = Math.round(chunk.chunkSize * this.levelBlockSize / 50)
         velX = velX * this.levelBlockSize / 50
         velY = velY * this.levelBlockSize / 50
         this.particles.push(new Particle(chunk.position.x, chunk.position.y, size, velX, velY, this.gravity, chunk.color))
      });
   }

   updateParticles() {
      this.particles.forEach(particle => {
         particle.update()
      })
   }

   drawParticles() {
      this.particles.forEach(particle => {
         particle.draw()
      })
   }
   
}