const express = require('express');
const cors = require('cors')

const app = express();
const port = 3000;


// import controllers
const { notemaker } = require('./controllers/openai.controller');

// Set middleware
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/create-notes', async (req, res) => {
    const prompt = req.body.prompt;
    const message = await notemaker(prompt);
    res.json({ notes: message });
})


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
})