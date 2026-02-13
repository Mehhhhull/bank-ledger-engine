const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required to create an account"],
      index: true, //uses B-tree in backgroud. Speed will be fast while searching
    },
    status: {
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "Status must be either ACTIVE, FROZEN or CLOSED",
      },
    },
    currency: {
      type: String,
      required: [true, "Currency is required to create an account"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;
