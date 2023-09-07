const Offer = require("../Models/offerModel");
const User = require("../Models/userModel.JS");


function shortenString(str, maxLength) {
  if (str.length <= maxLength) {
    return str;
  } else {
    return str.slice(0, maxLength - 3) + '...';
  }
}


//Middleware functions
const addOffer = async (req, res) => {
  try {
    const {
      userId,
      description,
      bookIHaveTitle,
      bookIHaveOlid,
      bookIHaveUrlToImage,
      bookIWantTitle,
      bookIWantOlid,
      bookIWantUrlToImage,
    } = req.body;

    const offer = await Offer.create({
      bookIWant: {
        title: bookIWantTitle,
        olid: bookIWantOlid,
        urlToImage: bookIWantUrlToImage,
      },
      bookIHave: {
        title: bookIHaveTitle,
        olid: bookIHaveOlid,
        urlToImage: bookIHaveUrlToImage,
      },
      description,
      userId,
    });

    res.json(offer);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const removeOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    await Offer.findByIdAndDelete(offerId);
    await User.updateMany(
      { 'chat.offerId': offerId },
      { $pull: { chat: { offerId: offerId } } }
    ); 
    res.json({ deleted: true });
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getOffers = async (req, res) => {
  try {
    const { booksForExchange, booksRequired, userId } = req.body;
    let offers = await Offer.find();
    offers = offers.filter((offer) => {
      return offer.userId.toString() !== userId.toString();
    });
    let areRelevantOffersFound = false;
    let relevantOffers = offers.filter((offer) => {
      let mySide = false;
      let yourSide = false;
      booksForExchange.map((book) => {
        if (book.title === offer.bookIWant.title) {
          mySide = true;
        }
      });
      booksRequired.map((book) => {
        if (book.title === offer.bookIHave.title) {
          yourSide = true;
        }
      });
      if (mySide && yourSide) {
        areRelevantOffersFound = true;
      }
      return mySide && yourSide;
    });
    if (areRelevantOffersFound) {
      
      const relevantOffersPromises = relevantOffers.map(async (offer) => {
        const user = await User.findById(offer.userId);
        const userName = user.userName;
        const image = user.image;
        return {
          ...offer.toObject(),
          userName,
          image,
        };
      });

      // Now, use Promise.all to await all promises
      const newRelevantOffers = await Promise.all(relevantOffersPromises);

      newRelevantOffers.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);

        // Compare the dates in reverse order (latest first)
        return dateB - dateA;
      });

      res.json({ offers: newRelevantOffers, RelevantOffersFound: true });
      return;
    }

    let testPromises = offers.map(async (offer) => {
      const user = await User.findById(offer.userId);
      const userName = user.userName;
      const image = user.image;
      return {
        ...offer.toObject(),
        userName,
        image,
      };
    });

    // Use Promise.all to await all promises
    let allOffers = await Promise.all(testPromises);

    allOffers.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      // Compare the dates in reverse order (latest first)
      return dateB - dateA;
    });

    res.json({ offers: allOffers, RelevantOffersFound: false });
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getUserOffers = async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await User.findOne({ userName });
    const { _id, image } = user;
    const offers = await Offer.find({ userId: _id });

    res.json({ offers, userImage: image });
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getAllOffers = async (req, res)=>{
  try {
    const { userId } = req.params;
const offers = await Offer.find();
let filteredOffers = offers.filter((offer) => offer.userId.toString() !== userId.toString());

filteredOffers.sort((a, b) => {
  const dateA = new Date(a.createdAt);
  const dateB = new Date(b.createdAt);

  // Compare the dates
  if (dateA > dateB) {
    return -1; // Return a negative value to place "a" before "b"
  } else if (dateA < dateB) {
    return 1; // Return a positive value to place "b" before "a"
  } else {
    return 0; // Dates are equal, no change in order
  }
});

// Map offers to include user data using Promise.all
const mappedOffers = await Promise.all(
  filteredOffers.map(async (offer) => {
    const user = await User.findById(offer.userId);
    return {
      ...offer.toObject(),
      userName: user.userName,
      image: user.image,
    };
  })
);

res.json(mappedOffers);

  } catch (error) {
    res.json({ error: error.message });
  }
}

const getOfferDescription = async (req, res)=>{
  try {
    const {offerId} = req.params;
    const offer = await Offer.findById(offerId);
    const description = shortenString(offer.description, 25)
    res.json(description)
  } catch (error) {
    res.json({ error: error.message });
  }
}


module.exports = {
  addOffer,
  removeOffer,
  getOffers,
  getUserOffers,
  getAllOffers,
  getOfferDescription,
};
