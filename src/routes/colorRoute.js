'use strict'

const express = require('express')
const router = express.Router()
const { createColor, updateColor, getTheColor, getAllColors, deleteTheColor } = require('../controller/colorCtrl')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware')

router.post('/', authMiddleware, isAdmin, createColor)

router.put('/:id', authMiddleware, isAdmin, updateColor)

router.get('/', authMiddleware, isAdmin, getAllColors)
router.get('/:id', authMiddleware, isAdmin, getTheColor)

router.delete('/:id', authMiddleware, isAdmin, deleteTheColor)

module.exports = router
