const express = require('express');
const { getBooksByGenre, getBooks, getOneBook } = require('../Controllers/bookController');
const router = express.Router();


router.post('/getBooks', getBooks);
router.post('/getOneBook', getOneBook);
router.get("/getBooksByGenre/:genre", getBooksByGenre);

module.exports = router; 