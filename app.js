import express from 'express'
import userRoutes from './routes/user.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname)))

app.use('/api', userRoutes)

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000')
    console.log('HTML: http://localhost:3000/test.html')
})
