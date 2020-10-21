const express = require('express');
const {getUser,getUsers,createUser,deleteUser,updateUser} = require('../controllers/users');

const User = require('../models/User')

const {protect, authorize} = require('../middleware/auth')
const router = express.Router({mergeParams:true});


const advancedResults = require('../middleware/advancedresult')

router.use(protect);
router.use(authorize('admin'));

router.route('/')
.get(advancedResults(User),getUsers)
.post(createUser)


router
.route('/:id')
.get(getUser)
.put(updateUser)
.delete(deleteUser)


module.exports = router;