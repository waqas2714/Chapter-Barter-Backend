const { default: axios } = require("axios");
const User = require("../Models/userModel.JS");
const Offer = require("../Models/offerModel.js");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.YOUR_CLOUD_NAME,
  api_key: process.env.YOUR_API_KEY,
  api_secret: process.env.YOUR_API_SECRET,
});

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

function removeDuplicateObjects(arr) {
  const uniqueStrings = new Set();
  const uniqueObjects = [];

  for (const obj of arr) {
    const objAsString = JSON.stringify(obj); // Convert object to string
    if (!uniqueStrings.has(objAsString)) {
      uniqueStrings.add(objAsString); // Add the string to the Set
      uniqueObjects.push(obj); // Add the object to the result array
    }
  }

  return uniqueObjects;
}

//Middleware Functions

const keepAlive = (req, res)=>{
  res.send("I am alive");
}

const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    const isVerified = await jwt.verify(token, process.env.JWT_SECRET);
    if (isVerified) {
      res.json({ isVerified : true });
    } else {
      res.json({ isVerified : false });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
};

const signupUser = async (req, res) => {
  const { userName, password, email } = req.body;
  try {
    if (!userName || !email || !password) {
      throw new Error("Please Provide All the neccessary fields.");
    }
    const userNameCheck = await User.findOne({ userName });
    if (userNameCheck) {
      throw new Error(
        "This username is already taken, please try another one."
      );
    }
    const user = await User.create({
      userName,
      email,
      password: await encryptPassword(password),
    });

    const token = generateToken(user._id);

    res.status(200).json({ user, token });
  } catch (error) {
    res.json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { password, userName } = req.body;
  try {
    if (!userName || !password) {
      throw new Error("Please Provide All the neccessary fields.");
    }
    const user = await User.findOne({ userName });
    if (!user) {
      throw new Error("No user registered with this Username.");
    }
    const isVerified = await bcrypt.compare(password, user.password);
    if (!isVerified) {
      throw new Error("One of the fields is not correct, Please check again.");
    }
    const { _id } = user;

    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      email: user.email,
      userName: user.userName,
      image: user.image,
      booksRequired: user.booksRequired,
      booksForExchange: user.booksForExchange,
      token,
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};

// const updateProfile = async (req, res) => {
//   try {
//     const { userName, userId } = req.body;
//     let result;
//     if (req.file) {
//       result = await cloudinary.uploader.upload(req.file.path, {
//         folder: "Book Exhchange App",
//       });

//       const user = await User.findById(userId);
//       user.image = result.secure_url.toString();
//       await user.save();

//       res.status(200).json(user);
//       return;
//     }

//     if (userName === "") {
//       const user = await User.findById(userId);
//       res.json(user);
//       return;
//     }

//     const user = await User.findByIdAndUpdate(
//       userId,
//       {
//         userName,
//       },
//       { new: true }
//     );
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    let result;

    if (req.file) {
      // Upload the new image to Cloudinary
      result = await cloudinary.uploader.upload(req.file.path, {
        folder: "Book Exchange App", // Note the corrected folder name
      });

      // Update the user's image URL in the database
      const user = await User.findById(userId);
      user.image = result.secure_url.toString();
      await user.save();
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const updateBooksForExchange = async (req, res) => {
  const { userId, title, olid } = req.body;
  try {
    const user = await User.findById(userId);
    const booksForExchange = user.booksForExchange;
    const requiredBook = booksForExchange.find((book) => {
      return title === book.title;
    });
    if (requiredBook) {
      res.json(user.booksForExchange);
      return;
    }
    const urlToImage = `https://covers.openlibrary.org/b/olid/${olid}-L.jpg`;
    const newList = [...booksForExchange, { title, olid, urlToImage }];
    user.booksForExchange = newList;
    await user.save();

    res.json(user.booksForExchange);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const removeBooksForExchange = async (req, res) => {
  try {
    const { userId, title } = req.body;
    const user = await User.findById(userId);
    const booksForExchange = user.booksForExchange;
    const updatedBooksForExchange = booksForExchange.filter((book) => {
      return title !== book.title;
    });
    user.booksForExchange = updatedBooksForExchange;
    await user.save();

    res.json(user.booksForExchange);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const updateBooksRequired = async (req, res) => {
  const { userId, title, olid } = req.body;
  try {
    const user = await User.findById(userId);
    const booksRequired = user.booksRequired;
    const requiredBook = booksRequired.find((book) => {
      return title === book.title;
    });
    if (requiredBook) {
      res.json(user.booksRequired);
      return;
    }
    const urlToImage = `https://covers.openlibrary.org/b/olid/${olid}-L.jpg`;
    const newList = [...booksRequired, { title, olid, urlToImage }];
    user.booksRequired = newList;
    await user.save();

    res.json(user);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const removeBooksRequired = async (req, res) => {
  try {
    const { userId, title } = req.body;
    const user = await User.findById(userId);
    const booksRequired = user.booksRequired;
    const updatedBooksRequired = booksRequired.filter((book) => {
      return title !== book.title;
    });
    user.booksRequired = updatedBooksRequired;
    await user.save();

    res.json(user.booksRequired);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getUserBooks = async (req, res) => {
  try {
    const { userName } = req.body;
    const user = await User.findOne({ userName });
    const booksRequired = user.booksRequired;
    const booksForExchange = user.booksForExchange;

    res.json({ booksRequired, booksForExchange });
  } catch (error) {
    res.json({ error: error.message });
  }
};

const addChat = async (req, res) => {
  try {
    const { userId, userName, message, offerId } = req.body; //Username of recipient
    const user = await User.findById(userId);
    const recipient = await User.findOne({ userName });
    const updatedChat = [
      ...user.chat,
      { message, recipient: recipient._id, offerId },
    ];
    user.chat = updatedChat;
    await user.save();

    res.json(user);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const removeChat = async (req, res) => {
  try {
    const { offerId } = req.body;

    const users = await User.find({
      "chat.offerId": offerId,
    });

    // Process each user
    await Promise.all(
      users.map(async (user) => {
        // Remove chat objects with the specified offerId
        user.chat = user.chat.filter(
          (chatObj) => chatObj.offerId.toString() !== offerId
        );

        // Save the changes to the user document
        await user.save();
      })
    );

    res.status(200).json({ isRemoved: true });
  } catch (error) {
    res.json({ error: error.message, isRemoved: false });
  }
};

const getChat = async (req, res) => {
  try {
    const { senderId, recipientId, offerId } = req.body;

    // Initiate both requests simultaneously using Promise.all
    const [sender, recipient] = await Promise.all([
      User.findOne({ _id: senderId }),
      User.findOne({ _id: recipientId }),
    ]);
    const senderChats = sender.chat.filter((item) => {
      return (
        item.offerId.toString() === offerId.toString() &&
        item.recipient.toString() === recipientId.toString()
      );
    });
    const recipientChats = recipient.chat.filter((item) => {
      return (
        item.offerId.toString() === offerId.toString() &&
        item.recipient.toString() === senderId.toString()
      );
    });

    // const senderChats = sender.chat;
    // const recipientChats = recipient.chat;

    // Merge the senderChats and recipientChats arrays
    const allChats = [...senderChats, ...recipientChats];

    // Sort the merged array by the sentAt property (oldest first)
    allChats.sort((a, b) => a.sentAt - b.sentAt);

    // Now you can use the sorted merged array (allChats) as needed
    res.json(allChats);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await User.findOne({ userName });
    const { email, booksRequired, booksForExchange, image } = user;

    res.json({ userName, email, booksRequired, booksForExchange, image });
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const { userName, image } = user;

    res.json({ userName, image });
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getContacts = async (req, res) => {
  try {
    const { userName } = req.params;

    // Fetch the user by username
    const user = await User.findOne({ userName });
    const userId = user._id;
    let userChats = user.chat;

    // Fetch all recipients in parallel using Promise.all
    const messageRecipients = await Promise.all(
      userChats.map(async (chat) => {
        const receiver = await User.findById(chat.recipient);

        return {
          recipientName: receiver.userName,
          recipientImage: receiver.image,
          recipientId: chat.recipient,
          offerId: chat.offerId,
        };
      })
    );

    // Fetch all senders in parallel using Promise.all
    const messageSenders = await User.find({
      chat: {
        $elemMatch: { recipient: userId },
      },
    });

    // Process senders using map and reduce to flatten the result array
    let extraChats = messageSenders
      .map((user) => {
        return user.chat.map((chat) => {
          if (chat.recipient.toString() === userId.toString()) {
            return {
              recipientName: user.userName,
              recipientImage: user.image,
              recipientId: user._id,
              offerId: chat.offerId,
            };
          }
        });
      })
      .reduce((acc, val) => acc.concat(val), []);

    const uniqueArraySenders = await removeDuplicateObjects(extraChats);
    const uniqueArrayRecipients = await removeDuplicateObjects(
      messageRecipients
    );
    let finalUniqueArray = [...uniqueArraySenders, ...uniqueArrayRecipients];
    finalUniqueArray = removeDuplicateObjects(finalUniqueArray);
    let arrayWithoutNull = finalUniqueArray.filter((item)=>item != null)

    res.json(arrayWithoutNull);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getDeals = async (req, res) => {
  try {
    const { userId } = req.params;

    const allChats = await User.aggregate([
      {
        $unwind: "$chat" // Unwind the chat array, creating a new document for each chat message
      },
      {
        $project: {
          _id: 0, // Exclude the _id field from the result
          sender: "$_id", // Create a new field 'sender' with the value of the user's _id
          message: "$chat.message",
          recipient: "$chat.recipient",
          offerId: "$chat.offerId",
          sentAt: "$chat.sentAt"
        }
      }
    ])

    const requiredChats = allChats.filter((chat)=>{
      return chat.sender.toString()===userId || chat.recipient.toString()===userId
    })

    const dealPromises = requiredChats.map(async (chat) => {
      const offer = await Offer.findById(chat.offerId);
      if (chat.recipient.toString() === userId) {
          const sender = await User.findById(chat.sender);
          return {
            recipient: chat.sender,
            name : sender.userName,
            description: offer.description,
            offerId: chat.offerId,
          };
        }else{
          const recipient = await User.findById(chat.recipient);
          return {
            recipient: chat.recipient,
            name : recipient.userName,
            description: offer.description,
            offerId: chat.offerId,
          };
        }
        
    });

    let deals = await Promise.all(dealPromises);

    const uniqueArray = Array.from(new Set(deals.map(JSON.stringify))).map(JSON.parse);

    deals = uniqueArray.map(obj => {
      // Truncate 'name' to 5 characters and 'description' to 10 characters
      const truncatedName = obj.name.length > 10 ? obj.name.slice(0, 10) + "..." : obj.name;
      const truncatedDescription = obj.description.length > 35 ? obj.description.slice(0, 35) + "..." : obj.description;

      // Create a new object with truncated 'name' and 'description' properties
      return {
        ...obj, // Copy other keys and values from the original object
        name: truncatedName,
        description: truncatedDescription
      };
    });

    res.json(deals);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const doneDeal = async (req, res) => {
  try {
    const { userId, offerId, recipientId } = req.body;
    const user = await User.findById(userId);
    const recipient = await User.findById(recipientId);

    let userChats = user.chat;
    let recipientChats = recipient.chat;

     userChats = userChats.filter((item) => {
      return (
        item.offerId.toString() !== offerId.toString() ||     // T T F F 
        item.recipient.toString() !== recipientId.toString()  // T F T F 
      );
    });

     recipientChats = recipientChats.filter((item) => {
      return (
        item.offerId.toString() !== offerId.toString() ||
        item.recipient.toString() !== userId.toString()
      );
    });

    user.chat = userChats;
    recipient.chat = recipientChats;

    await user.save();
    await recipient.save();

    res.json({ userChat: user.chat, recipientChat: recipient.chat });
  } catch (error) {
    res.json({ error: error.message });
  }
};

module.exports = {
  keepAlive,
  signupUser,
  loginUser,
  updateBooksForExchange,
  removeBooksForExchange,
  updateBooksRequired,
  removeBooksRequired,
  getUserBooks,
  addChat,
  removeChat,
  getChat,
  updateProfile,
  verifyToken,
  getSingleUser,
  getUserInfo,
  getContacts,
  getDeals,
  doneDeal,
};
