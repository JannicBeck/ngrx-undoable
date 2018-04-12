import * as express from "express"
import * as http from "http"
import * as cors from "cors"

const database = new Set()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get("/", (req, res, next) => {
  res.status(200).json(Array.from(database).toString())
})

app.post("/bears", (req, res, next) => {
  console.log('posted bear', req.body.bear)
  database.add(req.body.bear)
  res.status(200).json(req.body)
})

app.delete("/bears", (req, res, next) => {
  console.log('deleted bear', req.body.bear)
  database.delete(req.body.bear)
  res.status(200).json(req.body)
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

const port = process.env.PORT || "3000"
app.set("port", port)

const server = http.createServer(app)

server.listen(port)
