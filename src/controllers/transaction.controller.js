const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req, res) {
  /**
   * 1. Validate request
   */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "FromAccount, toAccount, amount, idempotencyKey  is required",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  }); //...

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  }); //...

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid to or from account",
    });
  }

  /**
   * 2. Validate idempotency key
   */
  const isTransactionAlreadyExsists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });
  if (isTransactionAlreadyExsists) {
    if (isTransactionAlreadyExsists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction Already Processed",
        transaction: isTransactionAlreadyExsists,
      });
    }
    if (isTransactionAlreadyExsists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is stil processing",
      });
    }
    if (isTransactionAlreadyExsists.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction processing failed previosly,please retry",
      });
    }
    if (isTransactionAlreadyExsists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry!!!",
      });
    }
  }

  /**
   * 3. Check account status
   */
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be active to process transaction",
    });
  }
  /**
   * 4. Derive sender balance from ledger
   */
  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance . Current Balance is ${balance}. Requested amount is ${anount}`,
    });
  }

  /**
   * 5.Create Transaction(Pending), this is important
   */
  const session = await mongoose.startSession();
  session.startTransaction();
  //iske baad kuch bhi likhoge wo ya toh pura complete hoga wrna revert back hojayega

  const transaction = await transactionModel.create(
    {
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    },
    { session },
  );

  const debitLedgerEntry = await ledgerModel.create(
    {
      account: fromAccount,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT",
    },
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    {
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT",
    },
    { session },
  );

  transation.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  /**
   * 10. Send email notification
   */

  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
  );
  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction,
  });
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body

  if(!toAccount|| !amount|| !idempotencyKey){
    return res.status(400).json({
      message:"toAccount,amount and idempotency key is required"
    })
  }
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};
