require('dotenv').config()
const express = require('express')

const app = express()
app.use(express.json()) 
app.use(express.urlencoded({extended: true}))

const PORT = process.env.PORT || 3000
console.log(PORT)

app.get('/', (req, res) => {
    res.send(`
            <h1>Curso Express.js V2</h1>
            <p>Esto es una aplicacion node.js con express.js</p>
            <p>Corre en el puerto: ${PORT}</p>
        `)
})

app.get('/users/:id', (req, res) =>{
    const userId = req.params.id
    res.send(`Mostrar informacion del usuario con ID: ${userId}`)
})

app.get('/search', (req, res) =>{
    const terms = req.query.termino || 'No especificado'
    const category = req.query.categoria || 'Todas'

    res.send(`
            <h2>Resultados de Busqueda:</h2>
            <p>Termino: ${terms}</p>
            <p>Categoria: ${category}</p>
        `)
})

app.post('/form', (req, res)=>{
    const name = req.body.nombre || 'Anonimo'
    const email = req.body.email || 'No proporcionado'
    res.json({
        mesage: 'Datos recividos',
        data: {
            name,
            email
        }
    })
})

app.post('/api/data', (req, res) => {
    const data = req.body

    if(!data || Object.keys(data).length ===0){
        return res.status(400).json({error: 'No se recibieron datos'})
    }

    res.status(201).json({
        mesage: 'Datos JSON recibidos',
        data
    })
})


app.listen(PORT, () =>{
    console.log(`Servidor: http://localhost:${PORT}`)
})