const express = require('express');
const app = express();
const cors = require('cors');
const port = 8080

app.use(express.json());
app.use(cors());

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    console.log('Received data:', { username, password });
  
    res.status(200).json({ message: 'Data received successfully!' });
  });

app.listen(port, () => {
    console.log('server listening on port 8080')
})
