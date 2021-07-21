const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy) {
    try {
    const criteria = _buildCriteria(filterBy)
    
    const collection = await dbService.getCollection('stay')
    const stays = await collection.find(criteria).toArray()
//     let regex = new RegExp(filterBy.name, 'i')
//    return stays.filter((stay) => regex.test(stay.name));
   return stays
} catch (err) {
logger.error('cannot find stays', err)
throw err
}
}


// async function query(filterBy = {}) {
//     try {
//         const criteria = _buildCriteria(filterBy)
//         const collection = await dbService.getCollection('stays')
//         const stays = await collection.find(criteria).toArray()
//         stays = await collection.aggregate([
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
//         stays = stays.map(stay => {
//            stay.byUser = { _id:stay.byUser._id, fullname:stay.byUser.fullname }
//            stay.aboutUser = { _id:stay.aboutUser._id, fullname:stay.aboutUser.fullname }
//             delete stay.byUserId
//             delete stay.aboutUserId
//             return stay
//         })

//         return stays
//     } catch (err) {
//         logger.error('cannot find stays', err)
//         throw err
//     }

// }

// async function remove(stayId) {
//     try {
//         const collection = await dbService.getCollection('stays')
//         await collection.deleteOne({"_id":ObjectId(stayId)})
//     } catch (err) {
//         logger.error(`cannot remove stay ${stayId}`, err)
//         throw err
//     }
// }


async function remove(stayId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { userId, isAdmin } = store
        const collection = await dbService.getCollection('stay')
        // remove only if user is owner/admin
        const query = { _id:+stayId }
        // const query = { _id: ObjectId(stayId) }
        console.log(query);
        if (!isAdmin) query.byUserId = ObjectId(userId)
        // await collection.deleteOne(query)
        return await collection.deleteOne({ _id: ObjectId(stayId), byUserId: ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}


async function add(stay) {
   
    try {
        // peek only updatable fields!
        const stayToAdd = {
            byUserId: ObjectId(stay.byUserId),
            // aboutUserId: ObjectId(stay.aboutUserId),
            name: stay.name,
  summary: stay.summary,
  price: stay.price,
  loc: { address: stay.loc.address },
  type: stay.type,
  createdAt: stay.createdAt,
  imgUrls: stay.imgUrls,
  reviews: stay.reviews ||[],
  host:{
    _id:stay.host._id ,
    fullname: stay.host.fullname ,
    imgUrl:stay.host.imgUrl
  }
        }
        
        const collection = await dbService.getCollection('stay')
        await collection.insertOne(stayToAdd)
        return stayToAdd;
    } catch (err) {
        // logger.error('cannot insert stay', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    let criteria = {
        $and:[]
    }
    const name = {$regex :JSON.parse(filterBy.loc).address,$options :'i'}
console.log('name',name);
    criteria.$and.push({name : name})
  
    // if(filterBy.inStock==='inStock')criteria.$and.push({inStock:true})
    // if(filterBy.inStock==='OutStock')criteria.$and.push({inStock:false})
    // if(filterBy.type==='funny')criteria.$and.push({type:'funny'})
    // if(filterBy.type==='sad')criteria.$and.push({type:'sad'}) 
    // if(filterBy.type==='sweet')criteria.$and.push({type:'sweet'})

    return criteria
}

async function getById(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        const stay = await collection.findOne({ '_id': ObjectId(stayId) })
        return stay
    } catch (err) {
        logger.error(`while finding user ${userId}`, err)
        throw err
    }
}

async function update(stay) {
    try {
        // peek only updatable fields!
        const stayToSave = {
            _id: ObjectId(stay._id),
            name: stay.name,
            summary: stay.summary,
            price: stay.price,
            type: stay.type,
            loc:stay.loc,
            imgUrls: stay.imgUrls,
            createdAt : stay.createdAt
            // reviews: stay.reviews
        }
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ '_id': stayToSave._id }, { $set: stayToSave })
        return stayToSave
    } catch (err) {
        logger.error(`cannot update stay ${stay._id}`, err)
        throw err
    }
}

async function addMany(stays) {
    const prms = []
    stays.forEach(stay => {
        prms.push(add(stay))
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


