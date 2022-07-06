export default class Utils {
   static async loadImage(src) {
      return await new Promise((resolve, reject) => {
         const img = new Image()
         img.onload = () => resolve(img)
         img.onerror = reject
         img.src = src
      })
   }


   static getImageChunks(image, posX, posY, size, rotation) {
      let invisCanvas = document.createElement('canvas')
      invisCanvas.height = canvas.height
      invisCanvas.width = canvas.width
      let invisibleCtx = invisCanvas.getContext('2d')
      invisibleCtx.save()
      invisibleCtx.translate(
         posX + image.width / 2,
         posY + image.height / 2
      )
      invisibleCtx.rotate(rotation * Math.PI / 180)
      invisibleCtx.translate(
         -(posX + image.width / 2),
         -(posY + image.height / 2)
      )
      invisibleCtx.drawImage(image, posX, posY)
      invisibleCtx.restore()
      
      let chunkSize = 5
      let chunks = []
      for (let i = 0; i < image.width / chunkSize; i++) {
         if (i % 2 === 0) continue // Skipping some pixels to improve performance
         for (let j = 0; j < image.height / chunkSize; j++) {
            if (j % 2 === 0) continue // Skipping some pixels to improve performance
            let chunk = invisibleCtx.getImageData(posX + j * chunkSize, posY + i * chunkSize, chunkSize, chunkSize)
            let data = chunk.data
            let color = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
            let position = {
               x: posX + j * size / image.width * chunkSize,
               y: posY + i * size / image.width * chunkSize
            }
            chunks.push({chunk, color, position, chunkSize})
         }
      }
      return chunks
   }
}