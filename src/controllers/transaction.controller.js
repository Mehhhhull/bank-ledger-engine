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
      res.status(200).json({
        message: "Transaction Already Processed",
        transaction: isTransactionAlreadyExsists,
      });
    }
    if (isTransactionAlreadyExsists.status === "PENDING") {
      res.status(200).json({
        message: "Transaction is stil processing",
      });
    }
    if (isTransactionAlreadyExsists.status === "FAILED") {
      res.status(500).json({
        message: "Transaction processing failed previosly,please retry",
      });
    }
    if(isTransactionAlreadyExsists.status==="REVERSED"){
      res.status(500).json({
        message:"Transaction was reversed, please retry!!!"
      })
    }
  }
}
