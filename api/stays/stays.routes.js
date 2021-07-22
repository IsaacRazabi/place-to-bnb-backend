const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {updateStay, getById, addStay, getStays, deleteStay} = require('./stays.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getStays)
router.post('/',  requireAuth, addStay)
router.delete('/:id',  requireAuth, deleteStay)
router.put('/', updateStay)
router.get('/:id', log, getById)
router.post('/many', requireAdmin, addStay)
// router.post('/', requireAdmin, addStay)




module.exports = router