import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import './Modals.css';
import { userSignUp } from '../../redux/Auth/user.actions';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Button, TextField } from '@material-ui/core';

Modal.setAppElement('#root')

const customStyles = {
  overlay: {
    zIndex: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    padding: 0,
  }
}

class SignupModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userName: '',
      email: '',
      password: '',
      bio: '',
      avatar: '',
      referralCode: ''
    }
  }

  onChangeUserName = (e) => {
    this.setState({ userName: e.target.value });
  }

  onChangeEmail = (e) => {
    this.setState({ email: e.target.value });
  }

  onChangePassword = (e) => {
    this.setState({ password: e.target.value });
  }

  onChangeReferralCode = (e) => {
    this.setState({ referralCode: e.target.value });
  }

  componentDidMount() {
  }

  onSubmitForm = async (e) => {
    e.preventDefault();
    const result = await this.props.userSignUp(this.state);
  
    if (result.status === 'success') {
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
              <div className='modal-body'>
                <h2>WELCOME TO RPS.GAME MTF! ⚔</h2>
                <p>CLICK YOUR BALANCE TO MAKE A DEPOSIT</p>
              </div>
              <div className="modal-footer">
                <Button onClick={() => { 
                  onClose(); 
                  this.props.closeModal();
                  this.props.openLoginModal();
                }}>Login now</Button>
              </div>
            </div>
          );
        }
      });
    }
  }

  render() {
    const { modalIsOpen, closeModal, openLoginModal, isDarkMode } = this.props;
    const { userName, email, password, referralCode } = this.state;
    return (
      <Modal
        isOpen={modalIsOpen}
        style={customStyles}
        contentLabel={this.props.title}
      >
        <div className={isDarkMode ? 'dark_mode' : ''}>
          <div className='modal-header'>
            <h2 className='modal-title'>REGISTER</h2>
            <Button className="btn-close" onClick={closeModal}>×</Button>
          </div>
          <div className="modal-body">
            <h4>WELCOME! ⚔🥋</h4>
            <form onSubmit={this.onSubmitForm} id="signupForm">
              <TextField
                placeholder="CasE SeNsItIvE"
                label="Your Username"
                required
                value={userName}
                onChange={this.onChangeUserName}
                fullWidth
                className="form-control"
                variant="outlined"
              />
              <TextField
                placeholder="FAKEEMAIL@DISCO.COM"
                type="email"
                label="Your Email"
                required
                value={email}
                onChange={this.onChangeEmail}
                fullWidth
                className="form-control"
                variant="outlined"
              />
              <TextField
                required
                placeholder="●●●●●●"
                type="password"
                label="Your Password"
                value={password}
                onChange={this.onChangePassword}
                fullWidth
                className="form-control"
                variant="outlined"
              />
              <TextField
                placeholder="V9FTGY"
                label="Referral"
                value={referralCode}
                onChange={this.onChangeReferralCode}
                fullWidth
                className="form-control"
                variant="outlined"
              />
            </form>
          </div>
          <div className="modal-footer">
            <Button className="btn-submit" type="submit" form="signupForm">
              Register
            </Button>
            <p className="m-0 sm-text-center">
              GOT ACCOUNT?{' '}
              <Button onClick={(e) => { closeModal(); openLoginModal(); }}>
                LOGIN HERE →
              </Button>
            </p>
            
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  isDarkMode: state.auth.isDarkMode,
});

const mapDispatchToProps = {
  userSignUp
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SignupModal);
