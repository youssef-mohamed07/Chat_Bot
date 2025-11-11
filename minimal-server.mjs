import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.post('/test', (req, res) => {
  console.log('Received request:', req.body)
  res.json({ message: 'Test successful', received: req.body })
})

app.listen(3001, () => {
  console.log('Test server running on http://localhost:3001')
})
