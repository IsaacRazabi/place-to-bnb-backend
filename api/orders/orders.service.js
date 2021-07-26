const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')
// const userService = require('../user/user.service')
const stayService = require('../stays/stays.service')




async function query() {

    try {
    // const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('order')
    const orders = await collection.find().toArray()
//     let regex = new RegExp(filterBy.name, 'i')
//    return orders.filter((order) => regex.test(order.name));
   return orders
} catch (err) {
logger.error('cannot find orders', err)
throw err
}
}


// async function query(filterBy = {}) {
//     try {
//         const criteria = _buildCriteria(filterBy)
//         const collection = await dbService.getCollection('orders')
//         const orders = await collection.find(criteria).toArray()
//         orders = await collection.aggregate([
//             {
//                 $match: filterBy
//             },
//             {
//                 $lookup:
//                 {
//                     localField: 'byUserId',
//                     from: 'user',
//                     foreignField: '_id',
//                     as: 'byUser'
//                 }
//             },
//             {
//                 $unwind: '$byUser'
//             },
//             {
//                 $lookup:
//                 {
//                     localField: 'aboutUserId',
//                     from: 'user',
//                     foreignField: '_id',
//                     as: 'aboutUser'
//                 }
//             },
//             {
//                 $unwind: '$aboutUser'
//             }
//         ]).toArray()
//         orders = orders.map(order => {
//            order.byUser = { _id:order.byUser._id, fullname:order.byUser.fullname }
//            order.aboutUser = { _id:order.aboutUser._id, fullname:order.aboutUser.fullname }
//             delete order.byUserId
//             delete order.aboutUserId
//             return order
//         })

//         return orders
//     } catch (err) {
//         logger.error('cannot find orders', err)
//         throw err
//     }

// }

// async function remove(orderId) {
//     try {
//         const collection = await dbService.getCollection('orders')
//         await collection.deleteOne({"_id":ObjectId(orderId)})
//     } catch (err) {
//         logger.error(`cannot remove order ${orderId}`, err)
//         throw err
//     }
// }


async function remove(orderId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { userId, isAdmin } = store
        const collection = await dbService.getCollection('order')
        // remove only if user is owner/admin
        const query = { _id:+orderId }
        // const query = { _id: ObjectId(orderId) }
      
        if (!isAdmin) query.byUserId = ObjectId(userId)
        // await collection.deleteOne(query)
        return await collection.deleteOne({ _id: ObjectId(orderId), byUserId: ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err)
        throw err
    }
}


async function add(order) {
    try {
        const orderToAdd = {
                hostId: order.hostId,
                createdAt: order.createdAt,
                buyer: {
                  _id: order.buyer._id,
                  fullname: order.buyer.fullname,
                },
                totalPrice: order.totalPrice,
                checkIn: order.checkIn,
                checkOut: order.checkOut,
                guests: order.guests,
                stay: {
                  _id: order.stay._id,
                  name: order.stay.name,
                  price: order.stay.price,
                },
                status: order.status,
                byUserId:order.byUserId,
                byUser:{
                  _id: order.byUser._id,
                  username: order.byUser.username,
                  fullname: order.byUser.fullname,
                }
              };
        
        const collection = await dbService.getCollection('order')
        await collection.insertOne(orderToAdd)

        
        const updatedStay =  await stayService.getById(order.stay._id)
        if(!updatedStay.orders) updatedStay.orders = []
        updatedStay.orders.push(orderToAdd);
        await stayService.update(updatedStay)

        return orderToAdd;
    } catch (err) {
        // logger.error('cannot insert order', err)
        throw err
    }
}

function _buildCriteria(filterBy='') {
    let criteria = {
       filterBy
    }
    // const name = {$regex :filterBy.loc.address,$options :'i'}
    // criteria.$and.push({name : name})
    // if(filterBy.inStock==='inStock')criteria.$and.push({inStock:true})
    // if(filterBy.inStock==='OutStock')criteria.$and.push({inStock:false})
    // if(filterBy.type==='funny')criteria.$and.push({type:'funny'})
    // if(filterBy.type==='sad')criteria.$and.push({type:'sad'}) 
    // if(filterBy.type==='sweet')criteria.$and.push({type:'sweet'})

    return criteria
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        const order = await collection.findOne({ '_id': ObjectId(orderId) })

        return order
    } catch (err) {
        logger.error(`while finding user ${userId}`, err)
        throw err
    }
}

async function update(order) {
    try {
        // peek only updatable fields!
    
        const orderToSave = {
            _id: ObjectId(order._id),
            buyer: {_id: order._id, fullname: order.fullname},
            createdAt: order.createdAt,
            checkIn: order.checkIn,
            checkOut: order.checkOut,
            hostId : order.hostId,
            status: order.status,
            stay: {_id: order.stay._id, name: order.stay.name, price: order.stay.price},
            totalPrice: order.totalPrice
        }
        const collection = await dbService.getCollection('order')
        await collection.updateOne({ '_id': orderToSave._id }, { $set: orderToSave })


  



        return orderToSave
    } catch (err) {
        logger.error(`cannot update order ${order._id}`, err)
        throw err
    }
}

async function addMany(orders) {
    const prms = []
    orders.forEach(order => {
        prms.push(add(order))
    })

    return await Promise.all(prms)
}



module.exports = {
    query,
    remove,
    add,
    getById,
    update,
    addMany
}


