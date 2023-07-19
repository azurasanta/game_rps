import React, { Component } from 'react';
import { connect } from 'react-redux';
import LoadingOverlay from 'react-loading-overlay';
import { setBalance } from '../../redux/Auth/user.actions';
import { addNewTransaction } from '../../redux/Logic/logic.actions';
import { getCustomerStatisticsData } from '../../redux/Customer/customer.action';
import Modal from 'react-modal';
import { Button, TextField } from '@material-ui/core';

import axios from '../../util/Api';
import { alertModal } from '../modal/ConfirmAlerts';
import { convertToCurrency } from '../../util/conversion';
Modal.setAppElement('#root')

const customStyles = {
    overlay: {
        zIndex: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    content: {
        top         : '50%',
        left        : '50%',
        right       : 'auto',
        bottom      : 'auto',
        transform   : 'translate(-50%, -50%)',
        padding: 0,
        background: 'transparent',
    }
}

class WithdrawModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            _id: this.props.userInfo._id,
            amount: 0,
            web3: props.web3,
            balance: props.balance,
            account: props.account,
            isLoading: false,
            totalWagered: 0,
            deposit: 0,
            amount: 0,
            balance: 0,
        };
    }

    handleAmountChange = (e) => {
        e.preventDefault();
        this.setState({
            amount: e.target.value
        })
        console.log(this.state.amount);
    }

    async componentDidMount() {
        const result = await this.props.getCustomerStatisticsData(this.state._id)
        this.setState({
          ...result
        })
      }

   
    send = async () => {
        
        
        try {
            
            if (this.state.amount < 5) {
                alertModal(this.props.isDarkMode, `WITHDRAWAL AMOUNT MUST BE MORE THAN 5 BUSD`)
                return;
            }

            if (this.state.totalWagered < 25) {
                alertModal(this.props.isDarkMode, `MUST HAVE WAGERED AT LEAST 25 BUSD`)
                return;
            }

            if (this.state.deposit < 5) {
                alertModal(this.props.isDarkMode, `DEPOSIT AT LEAST 5 BUSD FIRST`)
                return;
            }
            
            if (this.state.amount > this.props.balance) {
                alertModal(this.props.isDarkMode, `TRY LATER BROKIE`)
                return;
            }
            
            this.setState({ isLoading: true })
            const result = await axios.post('/stripe/withdraw_request/', { amount: this.state.amount, addressTo: this.state.account});
            
            if (result.data.success) {
                alertModal(this.props.isDarkMode, result.data.message)
                this.props.setBalance(result.data.balance);
                this.props.addNewTransaction(result.data.newTransaction);
                this.setState({ isLoading: false })
                this.props.closeModal();
            } else {
                this.setState({ isLoading: false })
                alertModal(this.props.isDarkMode, `SOMETHING IS WRONG - CONTACT @RPSBET ON TG`)
            }
        } catch(e) {
            this.setState({ isLoading: false })
            if (this.state.amount <= 0) {
                alertModal(this.props.isDarkMode, `Something went wrong`);
                return;
            }
        }

    }


      render() {
        const { totalWagered, deposit, amount, balance } = this.state;

        console.log({ loading: this.state.isLoading })
        return (
            <>
                <LoadingOverlay
                    active={true}
                    spinner
                    text="CONNECTING..."
                    styles={{
                        wrapper: {
                            position: 'fixed',
                            width: '100%',
                            height: '100vh',
                            zIndex: this.state.isLoading ? 999 : 0
                        }
                    }}
                />
                <Modal
                    isOpen={this.props.modalIsOpen}
                    onRequestClose={this.props.closeModal}
                    style={customStyles}
                    contentLabel="Deposit Modal"
                    account={this.state.web3account}
                >
                        <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
                            <div className='modal-header'>
                                <h2 className='modal-title'>WITHDRAW</h2>
                                <Button className="btn-close" onClick={this.props.closeModal}>×</Button>
                            </div>
                            <div className="modal-body edit-modal-body deposit-modal-body">
                               
                                <div className="modal-content-wrapper">
                                    <div className="modal-content-panel">
                                      
                                        <div id='withdrawal-status'>
                                        <h6>ELIGIBILILITY STATUS</h6>
                                    <div><span className="eligible-label">WAGERED (MIN {convertToCurrency(25)})</span><span style={{color: this.state.totalWagered < 25 ? "red" : "rgb(87, 202, 34)"}}>{convertToCurrency(this.state.totalWagered)}</span></div>
                                    <div><span className="eligible-label">DEPOSITS (MIN {convertToCurrency(5)})</span><span style={{color: this.state.deposit < 5 ? "red" : "rgb(87, 202, 34)"}}>{convertToCurrency(this.state.deposit)}</span></div>
                                        <div><span className="eligible-label">AMOUNT (MIN {convertToCurrency(5)})</span><span style={{color: this.state.amount < 5 ? "red" : "rgb(87, 202, 34)"}}>{convertToCurrency(this.state.amount)}</span></div>
                                        </div>
                                        <div className='balance'>
                                            </div>
                                <div className="input-amount">
                                    <TextField
                                    pattern="[0-9]*"
                                    variant='outlined'
                                    autoComplete='off'
                                    value={this.state.amount}
                                    onChange={this.handleAmountChange}
                                    InputProps={{
                                        endAdornment: "BUSD",
                                    }}
                                    className="form-control" />
                                  
                                    </div>
                                    <label className="availabletag">
                                        <span>IN-GAME BALANCE</span>:&nbsp;{convertToCurrency(this.props.balance)}
                                        </label>
                                    
                               
                                 
                                </div>
                            </div>
                        </div>
                                    <div className="modal-footer">
                                        <Button className="btn-submit" onClick={this.send}>Withdraw</Button>
                                        <Button className="btn-back" onClick={this.props.closeModal}>CANCEL</Button>
                                    </div>
                    </div>
                </Modal>
            </>
        )
    }
}

const mapStateToProps = state => ({
  isDarkMode: state.auth.isDarkMode,
  userInfo: state.auth.user,
});

const mapDispatchToProps = {
  setBalance,
  addNewTransaction,
  getCustomerStatisticsData,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WithdrawModal);
