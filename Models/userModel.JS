const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Name is Required."],
      unique: true
    },
    email: {
      type: String,
      required: [true, "Email is Required."],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        "Please provide a valid Email.",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is Required."],
      minLength: [6, "Password must contain atleast 6 characters."],
    },
    booksRequired: {
      type: [
        {
          title: {
            type: String,
            required: [true, "Source name of the news not provided"],
          },
          olid: {
            type: String,
            required: [true, "Title of the News not provided"],
          },
          urlToImage: {
            type: String,
            required: [true, "Image of the News not provided"],
          },
        },
      ],
    },
    booksForExchange: {
      type: [
        {
          title: {
            type: String,
            required: [true, "Source name of the news not provided"],
          },
          olid: {
            type: String,
            required: [true, "Title of the News not provided"],
          },
          urlToImage: {
            type: String,
            required: [true, "Image of the News not provided"],
          },
        },
      ],
    },
    chat: {
      type: [
        {
          message: {
            type: String,
            required: [true, "No message in the chat."],
          },
          recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Recipient Id is required."]
          },
          offerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Offer",
            required: [true, "Offer Id is required."]
          },
        sentAt : {
            type : Date,
            default : Date.now,
            required : true
        }
        },
      ],
    },
    image: {
        type: String,
        required: [true, "URL of image not found."],
        default : "https://res.cloudinary.com/dh4vbnhxm/image/upload/v1693376463/Book%20Exhchange%20App/mq6kjkq09o8gtqyocut8.png"
      },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
