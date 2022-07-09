const connectToMongo=require('./db');
connectToMongo();
const express = require('express');
const cors = require('cors')
const app = express();

const port = 5000;
//middleware
app.use(cors())
app.use(express.json())
//routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port, () => {
  console.log(`iNotebook backend listening on http://localhost:${port}...`)
})
