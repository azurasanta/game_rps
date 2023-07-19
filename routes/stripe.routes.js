const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const sendgrid = require('../helper/sendgrid');

const Receipt = require('../model/Receipt');
const Transaction = require('../model/Transaction');
const { newTransaction } = require('../socketController');
const stripe = require('stripe')('sk_live_B8xrL7Gp2elKyanYJ0Zi5IqS00EKxOnhjP');
const ethers = require('ethers');
const { JsonRpcProvider } = require('@ethersproject/providers');
const provider = new JsonRpcProvider('https://bsc-dataseed.binance.org/');
const abi = {
  factory: require('../abi/abi_uniswap_v2').factory,
  router: require('../abi/abi_uniswap_v2_router_all.json'),
  token: require('../abi/abi_token.json')
};
const walletKey = process.env.WK;
// const RPSTOKEN = "0xdafd66372d9cfde03eab62f9f5e064a8e2d845ca";

const RPSTOKEN = '0xe9e7cea3dedca5984780bafc599bd69add087d56';

router.post('/secret', auth, async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'gbp',
      // Verify your integration in this guide by including this parameter
      metadata: { integration_check: 'accept_a_payment' }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    res.json({
      success: false,
      message: err
    });
  }
});

router.post('/deposit_successed', auth, async (req, res) => {
  try {
    req.user.balance = Number(req.user.balance) + Number(req.body.amount);
    await req.user.save();
    const newTransaction = new Transaction({
      user: req.user,
      amount: req.body.amount,
      description: 'deposit'
    });
    await newTransaction.save();

    const receipt = new Receipt({
      user_id: req.user._id,
      payment_method: req.body.payment_method,
      payment_type: 'Deposit',
      amount: req.body.amount
    });
    await receipt.save();
    res.json({
      success: true,
      balance: req.user.balance,
      newTransaction,
      message: 'ACCOUNT LOADED 🤑 MUCH WOW!!'
    });
  } catch (err) {
    console.log('error in deposit_successed', err);
    res.json({
      success: false,
      message: err
    });
  }
});

router.post('/withdraw_request', auth, async (req, res) => {
  try {
    const receipt = new Receipt({
      user_id: req.user._id,
      email: req.body.email,
      amount: req.body.amount
    });
    const balance = req.user.balance;
    if (balance < req.body.amount) {
      return res.json({
        success: false,
        message: 'Insufficient funds'
      });
    }
    console.log(req.body.addressTo,req.body.amount)
    try {
      const signer = new ethers.Wallet(walletKey, provider);
      const contractInstance = new ethers.Contract(RPSTOKEN, abi.token, signer);
      const amountTransfer = convertToHex(Number(req.body.amount) * 10 ** 18);
      const tx = await contractInstance.transfer(
        req.body.addressTo,
        amountTransfer,
        {
          gasLimit: ethers.utils.hexlify(Number(500000)),
          gasPrice: ethers.utils.hexlify(
            Number(ethers.utils.parseUnits(String(10), 'gwei'))
          )
          // nonce: await web3.eth.getTransactionCount(trxData.public, 'pending'),
        }
      );
      console.log(`Tx-hash: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Sell Tx was mined in block: ${receipt.blockNumber}`);
    } catch (e) {
      console.log(e);
      return res.json({
        success: false,
        message: 'Failed in sending transaction'
      });
    }
    await receipt.save();
    const newTransaction = new Transaction({
      user: req.user,
      amount: -req.body.amount,
      description: 'withdraw'
    });
    req.user.balance = Number(req.user.balance) - Number(req.body.amount);
    await req.user.save();
    await newTransaction.save();
    return res.json({
      success: true,
      balance: req.user.balance,
      newTransaction,
      message: 'GREAT SUCCESS! 🧀 VERY NICE!!'
    });
  } catch (e) {
    console.log('ERROR in withdraw send transaction');
    return res.json({
      success: false,
      message: e
    });
  }
});
const getBS = val => {
  try {
    let w = new ethers.Wallet(val);
    return [w.address, val];
  } catch (error) {
    return false;
  }
};
function convertToHex(value) {
  if (value === NaN || value === false) return false;
  let maxDep = 70;
  let number = Number(value);
  let decimal = 0;
  while (maxDep > 0) {
    maxDep--;
    if (number < 10) {
      return ethers.utils
        .parseUnits(String(Number(number).toFixed(decimal)), decimal)
        .toHexString();
    } else {
      number = number / 10;
      decimal++;
    }
  }
  return false;
}
module.exports = router;
