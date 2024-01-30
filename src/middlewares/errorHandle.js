'use strict'

///not found
const notFound = (req, res, next) => {
   const error = new Error(`Not Found:${req.originalUrl}`)
   res.status(404)
   next(error)
}

///error handler
const errorHandler = (err, req, res, next) => {
   const statusCode = res.statusCode == 200 ? 500 : res.statusCode
   res.status(statusCode)
   res.json({
      message: err?.message || 'Internal Server Error',
      code: statusCode,
      stack: err?.stack,
   })
}
module.exports = { notFound, errorHandler }
