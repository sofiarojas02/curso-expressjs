const errorHandler = (err, req, res, next) =>{
    const statusCode = err.statusCode || 500
    const mesage = err.mesage || 'Ocurrio un error inesperado'

    console.error(`[ERROR] ${new Date().toISOString()} - ${statusCode} - ${mesage}`)

    if(err.stack){
        console.error(err.stack)
    }

    res.status(statusCode).json({
        status: 'Error',
        statusCode,
        mesage,
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
    })
}

module.exports = errorHandler