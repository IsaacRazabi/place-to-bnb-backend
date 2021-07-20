
const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const socketService = require('../../services/socket.service')
const ordersService = require('./orders.service')
const { json } = require('express')



async function getToys(req, res) {
    let filterData = JSON.parse(req.query.params);
    let {filterBy} = filterData;
    try {
        const orders = await ordersService.query(filterBy)
        res.send(orders)
    } catch (err) {
        logger.error('Cannot get orders', err)
        res.status(500).send({ err: 'Failed to get orders' })
    }
}



async function deleteToy(req, res) {
    console.log(req.params.id);
    try {
        await ordersService.remove(req.params.id)
        // res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        // logger.error('Failed to delete order', err)
        res.status(500).send({ err: 'Failed to delete order' })
    }
}


async function addToy(req, res) {
    try {
        var order = req.body
        console.log(req.body);
        order.byUserId = req.session.user._id
        order = await ordersService.add(order)
        
        // prepare the updated order for sending out
        order.byUser = await userService.getById(order.byUserId)
        order.aboutUser = await userService.getById(order.aboutUserId)

        console.log('CTRL SessionId:', req.sessionID);
        socketService.broadcast({type: 'order-added', data: order})
        socketService.emitToAll({type: 'user-updated', data: order.byUser, room: req.session.user._id})
        res.send(order)

    } catch (err) {
        console.log(err)
        // logger.error('Failed to add order', err)
        res.status(500).send({ err: 'Failed to add order' })
    }
}

async function getById(req, res) {
    const { id } = req.params
    try {
        const orders = await ordersService.getById(id)
        res.send(orders)
    } catch (err) {
        logger.error('Cannot get orders', err)
        res.status(500).send({ err: 'Failed to get orders' })
    }
}

async function addManyToys(req, res) {
    try {
        const { user } = req.session
        const vUser = await userService.getById(user?._id)

        if (!vUser?.isAdmin) {
            res.status(401).send({ err: 'Not allowed' })
            return
        }

        var { orders } = req.body
        // order.byUserId = req.session.user._id
        orders = await ordersService.addMany(orders)

        // prepare the updated order for sending out
        // order.byUser = await userService.getById(order.byUserId)
        // order.aboutUser = await userService.getById(order.aboutUserId)

        console.log('CTRL SessionId:', req.sessionID)
        // socketService.broadcast({ type: 'order-added', data: order })
        // socketService.emitToAll({ type: 'user-updated', data: order.byUser, room: req.session.user._id })
        res.send(orders)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add order', err)
        res.status(500).send({ err: 'Failed to add order' })
    }
}


async function updateToy(req, res) {
    try {
        const { user } = req.session
        const vUser = await userService.getById(user?._id)

        if (!vUser?.isAdmin) {
            res.status(401).send({ err: 'Not allowed' })
            return
        }

        var { order } = req.body
        // order.byUserId = req.session.user._id
        order = await ordersService.update(order)

        // prepare the updated order for sending out
        // order.byUser = await userService.getById(order.byUserId)

        console.log('CTRL SessionId:', req.sessionID)
        // socketService.broadcast({ type: 'order-added', data: order })
        // socketService.emitToAll({ type: 'user-updated', data: order.byUser, room: req.session.user._id })
        res.send(order)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add order', err)
        res.status(500).send({ err: 'Failed to add order' })
    }
}
// async function createToy(req, res){
//     try {
//         const {name, price, type, inStock} = req.body
//         const order = {
//             name,
//             price,
//             type,
//             inStock,
//             createdAt: new Date()
//         }
//         const newToy = await orderService.add(order)
//         res.send(newToy)
//     } catch (err) {
//         logger.error('Failed to create order', err)
//         res.status(500).send({ err: 'Failed to create order' })
//     }
// }

module.exports = {
    getToys,
    deleteToy,
    addToy,
    getById,
    addManyToys,
updateToy,
// createToy
}