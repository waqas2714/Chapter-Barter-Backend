const express = require('express');
const { signupUser, loginUser, updateBooksForExchange, updateBooksRequired, getUserBooks, addChat, removeChat, getChat, getOneBook, updateProfile, verifyToken, getSingleUser, getContacts, getUserInfo, removeBooksRequired, removeBooksForExchange, getDeals, doneDeal, keepAlive } = require('../Controllers/userController');
const { upload } = require('../utils/uploadFile');
const router = express.Router();

router.get("/keep-alive", keepAlive);
router.post("/signup", signupUser);
router.post('/login', loginUser);
router.put('/updateProfile', upload.single("image") ,updateProfile);
router.patch('/updateBooksForExchange', updateBooksForExchange);
router.patch('/removeBooksForExchange', removeBooksForExchange);
router.patch('/updateBooksRequired', updateBooksRequired);
router.patch('/removeBooksRequired', removeBooksRequired);
router.post('/getUserBooks', getUserBooks);
router.patch('/addChat', addChat);
router.post('/removeChat', removeChat);
router.post('/getChat', getChat);
router.post('/verifyToken', verifyToken);
router.get('/getSingleUser/:userName', getSingleUser);
router.get('/getUserInfo/:userId', getUserInfo);
router.get('/getContacts/:userName', getContacts);
router.get('/getDeals/:userId', getDeals);
router.post('/doneDeal', doneDeal);

module.exports = router; 