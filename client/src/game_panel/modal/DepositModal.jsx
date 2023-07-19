import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import axios from '../../util/Api';
import { alertModal } from '../modal/ConfirmAlerts';
import { setBalance } from '../../redux/Auth/user.actions';
import { addNewTransaction } from '../../redux/Logic/logic.actions';
import { BigNumber } from 'ethers';
import { Button, TextField } from '@material-ui/core';

import { tokenAddr, adminWallet } from '../../config/index.js';
import abi from '../../config/abi_token.json';
import { FaClipboard } from 'react-icons/fa';
import { convertToCurrency } from '../../util/conversion';
Modal.setAppElement('#root');
const customStyles = {
  overlay: {
    zIndex: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    padding: 0,
    background: 'transparent'
  }
};

class DepositModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      amount: 0,
      web3: props.web3,
      balance: props.balance,
      account: props.account
    };
  }

  handleAmountChange = e => {
    e.preventDefault();
    this.setState({
      amount: e.target.value
    });
  };
  send = async () => {
    if (this.state.amount <= 0) {
      alertModal(this.props.isDarkMode, `ENTER AN AMOUNT DUMBASS!`);
      return;
    }

    if (this.state.amount > this.state.balance) {
      alertModal(this.props.isDarkMode, `TRY LATER, BROKIE!`);
      return;
    }
    try {
      const web3 = this.state.web3;
      const contractInstance = new web3.eth.Contract(abi, tokenAddr);
      await new Promise((resolve, reject) => {
        var decimals = 18;
        try {
          const amount = BigNumber.from(this.state.amount).mul(
            BigNumber.from(10).pow(decimals)
          );
          contractInstance.methods
            .transfer(adminWallet, amount)
            .send({ from: this.state.account })
            .on('confirmation', function(confNumber, receipt) {
              resolve(true);
            })
            .on('error', function(error) {
              console.log(error);
              if (error.error.code != -32603) reject(error.message);
            });
        } catch (error) {
          console.log(error);
          reject('Failed');
        }
      });
    } catch (e) {
      console.log(e);
      alertModal(this.props.isDarkMode, `Failed transaction.`);
      return;
    }
    const result = await axios.post('/stripe/deposit_successed/', {
      amount: this.state.amount
    });

    if (result.data.success) {
      alertModal(this.props.isDarkMode, result.data.message);
      this.props.setBalance(result.data.balance);
      this.props.addNewTransaction(result.data.newTransaction);
      this.props.closeModal();
    } else {
      alertModal(
        this.props.isDarkMode,
        `Something went wrong. Please try again in a few minutes.`
      );
    }
  };
  toggleBtnHandler = () => {
    return this.setState({
      clicked: !this.state.clicked
    });
  };
  copy() {
    navigator.clipboard.writeText('0xe9e7cea3dedca5984780bafc599bd69add087d56');
  }
  render() {
    const styles = ['copy-btn'];
    let text = 'COPY CONTRACT';

    if (this.state.clicked) {
      styles.push('clicked');
      text = 'COPIED!';
    }
    return (
      <Modal
        isOpen={this.props.modalIsOpen}
        onRequestClose={this.props.closeModal}
        style={customStyles}
        contentLabel="Deposit Modal"
      >
        <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
          <div className="modal-header">
            <h2 className="modal-title">DEPOSIT</h2>
            <Button className="btn-close" onClick={this.props.closeModal}>
              ×
            </Button>
          </div>
          <div className="modal-body edit-modal-body deposit-modal-body">
            <div className="modal-content-wrapper">
              <div className="modal-content-panel">
                <h6>STEP 1.&nbsp;&nbsp;BUY BUSD</h6>
                <a
                  className="atag"
                  href="https://pancakeswap.finance/swap?outputCurrency=0xe9e7cea3dedca5984780bafc599bd69add087d56"
                  target="_blank"
                >
                  CLICK HERE TO BUY ON PCS
                </a>
                <div className="balance">
                  <h6>STEP 2.&nbsp;&nbsp;ENTER AMOUNT & DEPOSIT</h6>
                </div>
                <div>
                  <div className="input-amount">
                    <TextField
                      pattern="[0-9]*"
                      type="text"
                      variant="outlined"
                      autoComplete="off"
                      value={this.state.amount}
                      onChange={this.handleAmountChange}
                      className="form-control"
                      InputProps={{
                        endAdornment: 'BUSD'
                      }}
                    />
                    <br />
                  </div>
                  <label className="availabletag">
                    <span>WALLET BALANCE</span>:&nbsp;&nbsp;{' '}
                    {convertToCurrency(this.state.balance)}&nbsp;BUSD&nbsp;
                  </label>

                  {/* <button className={styles.join('')} onClick={() => {
                    this.toggleBtnHandler();
                    this.copy();
                }}><FaClipboard />&nbsp;{text}</button> */}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button className="btn-submit" onClick={this.send}>
              Deposit
            </Button>
            <Button className="btn-back" onClick={this.props.closeModal}>
              CANCEL
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  isDarkMode: state.auth.isDarkMode
});

const mapDispatchToProps = {
  setBalance,
  addNewTransaction
};

export default connect(mapStateToProps, mapDispatchToProps)(DepositModal);
