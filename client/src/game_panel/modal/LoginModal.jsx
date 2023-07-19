import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import './Modals.css';
import { Button, TextField } from '@material-ui/core';

import { userSignIn, getUser } from '../../redux/Auth/user.actions';
import {
  getMyGames,
  getMyHistory,
  getMyChat
} from '../../redux/Logic/logic.actions';
import history from '../../redux/history';

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

class LoginModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: props.email,
      password: props.password,
      showVerificationModal: false
    };
  }

  onChangeEmail = e => {
    this.setState({ email: e.target.value });
  };

  onChangePassword = e => {
    this.setState({ password: e.target.value });
  };

  onKeyDownDocument = event => {
    const { key } = event;
    if (key === 'Enter') {
      event.preventDefault();
      this.onSubmitForm(event);
    }
  };

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDownDocument);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDownDocument);
  }

  onSubmitForm = async e => {
    e.preventDefault();
    const result = await this.props.userSignIn(this.state);
    if (result.status === 'success') {
      // if (!result.user.is_activated) {
      //     this.props.openVerificationModal();
      // } else {
      this.props.initSocket();
      this.props.getMyGames();
      this.props.getMyHistory();
      this.props.getMyChat();
      history.push('/');
      // }
      this.props.closeModal();
    }
  };

  render() {
    return (
      <Modal
        closeTimeoutMS={500}
        isOpen={this.props.modalIsOpen}
        style={customStyles}
        contentLabel={this.props.title}
      >
        <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
          <div className="modal-header">
            <h2 className="modal-title">LOGIN</h2>
            <Button className="btn-close" onClick={this.props.closeModal}>
              ×
            </Button>
          </div>
          <div className="modal-body">
            <h4>WELCOME BACK! 🔫🤠</h4>
            <form onSubmit={this.onSubmitForm}>
              <TextField
                type="text"
                className="form-control"
                variant="outlined"
                label="Email or Username"
                id="email"
                value={this.state.email}
                onChange={this.onChangeEmail}
                autoComplete="on"
              />
              <TextField
                type="password"
                className="form-control"
                id="password"
                value={this.state.password}
                label="Password"
                variant="outlined"
                autoComplete="new-password"
                onChange={this.onChangePassword}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    this.onSubmitForm(e);
                  }
                }}
              />

              {/* <span onClick={(e) => { e.preventDefault(); this.props.closeModal(); this.props.openResetPasswordModal(); }}>FORGOT PASSWORD?</span> */}
              
           
            </form>
            
          </div>
          <div className="modal-footer">
            <Button onClick={this.onSubmitForm} className="btn-submit">
              Login
            </Button>
            <p className="m-0 sm-text-center">
              NEWBIE?{' '}
              <Button
                onClick={e => {
                  this.props.closeModal();
                  this.props.openSignupModal();
                }}
              >
                GET REGISTERED →
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
  email: state.auth.user.email,
  password: state.auth.user.password
});

const mapDispatchToProps = {
  userSignIn,
  getUser,
  getMyGames,
  getMyHistory,
  getMyChat
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);
