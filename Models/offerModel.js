const mongoose = require("mongoose");

const offerSchema = mongoose.Schema(
  {
    bookIWant: {
      title: {
        type: String,
        required: [true, "Title of bookIWant not provided."],
      },
      olid: {
        type: String,
        required: [true, "OLID of bookIWant not provided."],
      },
      urlToImage: {
        type: String,
        required: [true, "Image of bookIWant not provided."],
      },
    },
    bookIHave: {
      title: {
        type: String,
        required: [true, "Title of bookIHave not provided."],
      },
      olid: {
        type: String,
        required: [true, "OLID of bookIHave not provided."],
      },
      urlToImage: {
        type: String,
        required: [true, "Image of bookIHave not provided."],
      },
    },
    description: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id is required."],
    },
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
