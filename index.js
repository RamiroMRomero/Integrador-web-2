const express = require('express')
const path = require('path')
const translate = require("node-google-translate-skidz");

const app = express()


app.use(express.static(path.join(__dirname + '/public')))

app.get("/translate/:text", async (req, res) => {
    translation = await translateToSpanish(req.params.text)
    res.json( {textoTraducido: translation} )
})



app.use((req, res) => {
    res.status(404);
    res.send('<h1> ERROR 404 <h1>')
})

app.listen(3000, () => {
    console.log('app listening in port 3000')
})

async function translateToSpanish(texto) {
    const resultado = await translate({
        text: texto,
        source: 'en',
        target: 'es'
    })
    return resultado.translation
}