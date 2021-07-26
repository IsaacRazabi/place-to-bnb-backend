
const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const socketService = require('../../services/socket.service')
const staysService = require('./stays.service')
const ordersService = require('../orders/orders.service')
const { json } = require('express')
// const { orderService } = require('../../../frontend/src/services/order.service')



async function getStays(req, res) {
    let filterBy = req.query;
    try {
        const stays = await staysService.query(filterBy)
        res.send(stays)
    } catch (err) {
        logger.error('Cannot get stays', err)
        res.status(500).send({ err: 'Failed to get stays' })
    }
}



async function deleteStay(req, res) {
  
    try {
        await staysService.remove(req.params.id)
        // res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        // logger.error('Failed to delete stay', err)
        res.status(500).send({ err: 'Failed to delete stay' })
    }
}


async function addStay(req, res) {
    try {
        var stay = req.body
        stay.byUserId = req.session.user._id
        
        // prepare the updated stay for sending out
        stay.byUser = await userService.getById(stay.byUserId)
        // stay.aboutUser = await userService.getById(stay.aboutUserId)
        stay = await staysService.add(stay)

        console.log('CTRL SessionId:', req.sessionID);
        socketService.broadcast({type: 'stay-added', data: stay})
        socketService.emitToAll({type: 'user-updated', data: stay.byUser, room: req.session.user._id})
        res.send(stay)

    } catch (err) {
        console.log(err)
        // logger.error('Failed to add stay', err)
        res.status(500).send({ err: 'Failed to add stay' })
    }
}

async function getById(req, res) {
    const { id } = req.params
    try {
        const stays = await staysService.getById(id)
        res.send(stays)
    } catch (err) {
        logger.error('Cannot get stays', err)
        res.status(500).send({ err: 'Failed to get stays' })
    }
}

async function addManyStays(req, res) {
    try {
        const { user } = req.session
        const vUser = await userService.getById(user?._id)

        if (!vUser?.isAdmin) {
            res.status(401).send({ err: 'Not allowed' })
            return
        }

        var { stays } = req.body
        // stay.byUserId = req.session.user._id
        stays = await staysService.addMany(stays)

        // prepare the updated stay for sending out
        // stay.byUser = await userService.getById(stay.byUserId)
        // stay.aboutUser = await userService.getById(stay.aboutUserId)

        console.log('CTRL SessionId:', req.sessionID)
        // socketService.broadcast({ type: 'stay-added', data: stay })
        // socketService.emitToAll({ type: 'user-updated', data: stay.byUser, room: req.session.user._id })
        res.send(stays)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add stay', err)
        res.status(500).send({ err: 'Failed to add stay' })
    }
}


async function updateStay(req, res) {
    try {
   
        var stay  = req.body
       const orderToUpdate = await ordersService.getById(stay.orders[0]._id)
       orderToUpdate.status=stay.orders[0].status
       await ordersService.update(orderToUpdate)

        // const { user } = req.session
        // stay.byUserId = req.session.user._id
        // const vUser = await userService.getById(user?._id)
      
        // if (vUser._id!==stay.byUserId) {
        //     res.status(401).send({ err: 'Not allowed' })
        //     return
        // }

        stay = await staysService.update(stay)

        // prepare the updated stay for sending out
        // stay.byUser = await userService.getById(stay.byUserId)

        console.log('CTRL SessionId:', req.sessionID)
        // socketService.broadcast({ type: 'stay-added', data: stay })
        // socketService.emitToAll({ type: 'user-updated', data: stay.byUser, room: req.session.user._id })
        res.send(stay)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add stay', err)
        res.status(500).send({ err: 'Failed to add stay' })
    }
}
// async function createToy(req, res){
//     try {
//         const {name, price, type, inStock} = req.body
//         const stay = {
//             name,
//             price,
//             type,
//             inStock,
//             createdAt: new Date()
//         }
//         const newToy = await stayService.add(stay)
//         res.send(newToy)
//     } catch (err) {
//         logger.error('Failed to create stay', err)
//         res.status(500).send({ err: 'Failed to create stay' })
//     }
// }

module.exports = {
    getStays,
    deleteStay,
    addStay,
    getById,
    addManyStays,
updateStay,
// createToy
}