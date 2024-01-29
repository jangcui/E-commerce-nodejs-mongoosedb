'use strict'

const { ReasonPhrases } = require('../utils/httpStatusCode')
const statusCodes = require('../utils/statusCodes')

const StatusCode = {
   FORBIDDEN: 403,
   CONFLICT: 409,
}

const ReasonStatusCode = {
   FORBIDDEN: 'Bad request error',
   CONFLICT: 'Conflict error',
}

function ErrorResponse(message, status) {
   this.message = message
   this.status = status
}

function ConflictRequestError(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.CONFLICT) {
   ErrorResponse.call(this, message, statusCode)
}

ConflictRequestError.prototype = Object.create(ErrorResponse.prototype)

function BadRequestError(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.FORBIDDEN) {
   ErrorResponse.call(this, message, statusCode)
}
BadRequestError.prototype = Object.create(ErrorResponse.prototype)

function AuthFailureError(message = ReasonPhrases.UNAUTHORIZED, statusCode = statusCodes.UNAUTHORIZED) {
   ErrorResponse.call(this, message, statusCode)
}

AuthFailureError.prototype = Object.create(ErrorResponse.prototype)

function NotFoundError(message = ReasonPhrases.NOT_FOUND, statusCode = statusCodes.NOT_FOUND) {
   ErrorResponse.call(this, message, statusCode)
}
NotFoundError.prototype = Object.create(ErrorResponse.prototype)

function ForbiddenError(message = ReasonPhrases.FORBIDDEN, statusCode = statusCodes.FORBIDDEN) {
   ErrorResponse.call(this, message, statusCode)
}
ForbiddenError.prototype = Object.create(ErrorResponse.prototype)

module.exports = {
   ConflictRequestError,
   BadRequestError,
   AuthFailureError,
   ForbiddenError,
   NotFoundError,
}
