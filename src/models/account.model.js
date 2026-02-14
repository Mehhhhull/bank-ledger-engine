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
      type: String,
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "Status must be either ACTIVE, FROZEN or CLOSED",
        
      },
      default: "ACTIVE"
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

accountSchema.index({user:1,status:1}) //this will create a compound index on user and status fields. This will speed up the queries that filter by user and status.

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;
