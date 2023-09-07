const express = require('express');
const { addOffer, removeOffer, getOffers, getUserOffers, getAllOffers, getOfferDescription, getOffersForBook } = require('../Controllers/offerControllers');
const router = express.Router();


router.post('/addOffer', addOffer);
router.delete('/removeOffer/:offerId', removeOffer);
router.post('/getOffers', getOffers);
router.get('/getAllOffers/:userId', getAllOffers);
router.get('/getUserOffers/:userName', getUserOffers);
router.get('/getOfferDescription/:offerId', getOfferDescription);

module.exports = router; 