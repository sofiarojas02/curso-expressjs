require('dotenv').config()
const { error } = require('console')
const express = require('express')
const {validateUser} = require('./utils/validation')
const LoggerMiddleware = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const pool = require('./db');

const fs = require('fs')
const path = require('path')
const usersFilePath = path.join(__dirname, 'users.json')

const app = express()
app.use(express.json()) 
app.use(express.urlencoded({extended: true}))
app.use(LoggerMiddleware)
app.use(errorHandler)

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

app.get('/users', (req,res)=>{
    fs.readFile(usersFilePath, 'utf-8', (err,data) =>{
        if(err){
            return res.status(500).json({error: 'Error con la conexion de datos.'})
        }

        const users = JSON.parse(data)
        res.json(users)
    })
})

app.post('/users', (req, res) =>{
    const newUser = req.body
    if (!req.body.name || !req.body.email || req.body.name.trim() === '' || req.body.email.trim() === '') {
    return res.status(400).json({ error: 'Nombre de usuario o email incorrectos' })
}

    fs.readFile(usersFilePath, 'utf-8', (err, data)=>{
        if(err){
            return res.status(500).json({error: 'Error con la conexion de datos.'})
        }

        const users = JSON.parse(data)

        const validation = validateUser(newUser, users)
        if(!validation.isValid){
            return res.status(400).json({error: validation.errors})
        }

        users.push(newUser)
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) =>{
            if(err){
                return res.status(500).json({error: 'Error al guardar usuario'})
            }

            res.status(201).json(newUser)
        })
    })
})

app.put('/users/:id', (req, res) =>{
    const userId = parseInt(req.params.id, 10)
    const updatedUser = req.body

    fs.readFile(usersFilePath, 'utf-8', (err, data) =>{
        if(err){
            return res.status(500).json({error: 'Error con la conexion de datos.'})
        }

         let users = JSON.parse(data)
         users = users.map(user => (
            user.id === userId ? {...user, ...updatedUser} : user
        ))

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) =>{
            if(err){
                return res.status(500).json({error: 'Error al actualizar el usuario'})
            }

            res.json(updatedUser)
        })
    })
})

app.delete('/users/:id', (req, res) =>{
    const userID = parseInt(req.params.id, 10)
    fs.readFile(usersFilePath, 'utf8', (err, data) =>{
        if(err){
            return res.status(500).json({error: 'Error con la conexion de datos.'})
        }

        let users = JSON.parse(data)
        users = users.filter(user => user.id !== userID)

        fs.writeFile(usersFilePath, JSON.stringify(users, null ,2), (err)=>{
            if(err){
                return res.status(500).json({error: 'Error al eliminar el usuario'})
            }

            res.status(204).send()
        })
    })
})

app.get('/error', (req, res, next) =>{
    next(new Error('Error intencional'))
})


// app.get('/db-users', async (req, res) =>{
//     try{
//         const users = await prisma.user.findMany()
//         res.json(users)
//     }catch{
//         res.status(500).json({error: 'Error al comunicarse con la base de datos'})
//     }
// })

app.get('/db-users', async (req, res) => {
    try {
        // En vez de prisma.user.findMany(), traemos las filas directamente
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows); 
    } catch {
        res.status(500).json({ error: 'Error al comunicarse con la base de datos' });
    }
});

app.listen(PORT, () =>{
    console.log(`Servidor: http://localhost:${PORT}`)
})