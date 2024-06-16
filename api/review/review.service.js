const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    try {
        const collection = await dbService.getCollection('review')
        // console.log('filterBy:', filterBy)
        const reviews = await collection.find({ 'toyId': ObjectId(filterBy._id) }).toArray();
        if (reviews.length === 0) {
            reviews = await collection.find({ 'byUserId': ObjectId(filterBy._id) }).toArray();
            // console.log('reviews:', reviews)
        }
        return reviews
    } catch (err) {
        try {
            reviews = await collection.find({ 'byUserId': ObjectId(filterBy._id) }).toArray();
            // console.log('reviews:', reviews)
            return reviews
        } catch (error) {
            logger.error('cannot find reviews', err)
            throw err
        }
    }
}
// } catch (err) {
// }
// const reviews = await collection.find({ _id: ObjectId(filterBy._id) }).toArray();
// console.log('reviews:', reviews)
// console.log('reviews:', reviews)
// var reviews = await collection.aggregate([
//     {
//         $match: filterBy
//     },
//     {
//         $lookup:
//         {
//             from: 'toy',
//             localField: 'id',
//             foreignField: '_id',
//             as: 'toyReview'
//         }
//     },
//     {
//         $unwind: '$toyReview'
//     },
//     {
//         $lookup:
//         {
//             from: 'user',
//             localField: 'byUserId',
//             foreignField: '_id',
//             as: 'byUser'
//         }
//     },
//     {
//         $unwind: '$byUser'
//     }
// ]).toArray()

// }

async function remove(reviewId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { userId, isAdmin } = store
        const collection = await dbService.getCollection('review')
        // remove only if user is owner/admin
        const query = { _id: ObjectId(reviewId) }
        if (!isAdmin) query.byUserId = ObjectId(userId)
        await collection.deleteOne(query)
        // return await collection.deleteOne({ _id: ObjectId(reviewId), byUserId: ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}


async function add(review) {
    try {
        // peek only updatable fields!
        const reviewToAdd = {
            byUserId: ObjectId(review.byUserId),
            // aboutUserId: ObjectId(review.aboutUserId),
            txt: review.txt,
            toyId: ObjectId(review.toyId)
        }
        const collection = await dbService.getCollection('review')
        await collection.insertOne(reviewToAdd)
        return reviewToAdd;
    } catch (err) {
        logger.error('cannot insert review', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    return criteria
}

module.exports = {
    query,
    remove,
    add
}


