const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {updateOrder, getById, addOrder, getOrders, deleteOrder} = require('./orders.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getOrders)
router.post('/',  requireAuth, addOrder)
router.delete('/:id',  requireAuth, deleteOrder)
router.put('/', updateOrder)

router.get('/:id', log, getById)
router.post('/many', requireAdmin, addOrder)
router.post('/', requireAdmin, addOrder)




module.exports = router