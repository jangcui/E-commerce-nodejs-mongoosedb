'use strict'

const express = require('express')
const { getMyOrder, createOrderUser } = require('../controller/orderCtrl')
const { authMiddleware } = require('../middlewares/authMiddleware')
const router = express.Router()

router.post('/', authMiddleware, createOrderUser)

router.get('/', authMiddleware, getMyOrder)

module.exports = router
