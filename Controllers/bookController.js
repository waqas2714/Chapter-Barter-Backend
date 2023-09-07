const { default: axios } = require("axios");
const User = require("../Models/userModel.JS");
const Offer = require("../Models/offerModel");

const getBooks = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || title === "") {
      throw new Error("Please enter something to search for.");
    }
    let { data } = await axios.get(
      `https://openlibrary.org/search.json?title=${title}`
    );
    data = data.docs;

    const searchResults = await Promise.all(
      data.map(async (item) => {
        const image = item.cover_edition_key;
        return {
          title: item.title,
          olid: image,
          urlToImage: image
            ? `https://covers.openlibrary.org/b/olid/${image}-L.jpg`
            : undefined,
        };
      })
    );

    res.json(searchResults);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getOneBook = async (req, res) => {
  try {
    const { olid } = req.body;
    const { data } = await axios.get(
      `https://openlibrary.org/api/books?bibkeys=OLID:${olid}&format=json`
    );

    const url = data[`OLID:${olid}`]["thumbnail_url"];

    // Replace -S with -L in the URL
    const newUrl = url.replace(/-S\.jpg$/, "-L.jpg");

    const users = await User.find({
      "booksForExchange.olid": olid,
    });

    const owners = users.map((user) => {
      return {
        name: user.userName,
        image: user.image,
        id: user._id,
      };
    });
   
    const linkToPage =  data[`OLID:${olid}`]["info_url"];

    const index = linkToPage.indexOf("M/");

    let result = "";
    if (index !== -1) {
      // Extract the substring after "M/"
      const substring = linkToPage.substring(index + 2);

      // Replace underscores with spaces
       result = substring.replace(/_/g, " ");

      console.log(result);
    } else {
      console.log("String does not contain 'M/'");
    }
    let offers;
    try {
      offers = await Offer.find({
        $or: [
          { 'bookIWant.olid': olid },
          { 'bookIHave.olid': olid }
        ]
      }).exec();
    } catch (error) {
      res.json({ error: error.message });
    }

    const userPromises = offers.map(async (offer) => {
      const user = await User.findById(offer.userId);
      let userName = user.userName;
      let userImage = user.image;
      return {
        ...offer._doc, // Include only the _doc part
        userName,
        userImage,
      };
    });
    
    // Use Promise.all to await all the promises
    offers = await Promise.all(userPromises);

    res.json({
      urlToImage: newUrl,
      owners,
      name : result,
      offers
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getBooksByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const { data } = await axios.get(
      `https://openlibrary.org/subjects/${genre}.json`
    );
    const books = data.works.map((book) => {
      return {
        title: book.title,
        urlToImage: `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-L.jpg`,
        olid: book.cover_edition_key,
        date: book.first_publish_year,
      };
    });
    books.sort((a, b) => b.date - a.date);
    res.json(books);
  } catch (error) {
    res.json({ error: error.message });
  }
};

module.exports = {
  getBooksByGenre,
  getBooks,
  getOneBook,
};
