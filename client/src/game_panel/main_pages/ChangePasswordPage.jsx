import React, { Component } from 'react';
import { connect } from 'react-redux';
import { resetPassword } from '../../redux/Auth/user.actions';
import { alertModal } from '../modal/ConfirmAlerts';

class ChangePasswordPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      password_confirmation: ''
    };
  }

  componentDidMount() {
    console.log({ params: this.props.match.params });
  }

  handlePasswordChanged = e => {
    e.preventDefault();
    this.setState({ password: e.target.value });
  };

  handlePasswordConfirmationChanged = e => {
    e.preventDefault();
    this.setState({ password_confirmation: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    if (this.state.password === '') {
      alertModal(this.props.isDarkMode, 'Please input password');
      return;
    }

    if (this.state.password !== this.state.password_confirmation) {
      alertModal(this.props.isDarkMode, 'Not matched password confirmation');
      return;
    }
    console.log(this.props.match.params);

    const result = await this.props.resetPassword({
      code: this.props.match.params.code,
      password: this.state.password
    });

    if (result) {
      alertModal(
        this.props.isDarkMode,
        'Password has been changed. Please Login with your new password.'
      );
    }
  };

  render() {
    return (
      <div className="game-page reset-password-page">
        <div className="page-title">
          <h2 class="main-title desktop-only">Reset Password</h2>
        </div>
        <div className="game-contents">
          <div className="game-info-panel">
            <h3 className="game-sub-title">FRESH NEW PASSWORD!</h3>
            <p>New Password</p>
            <input
              type="password"
              className="form-control"
              value={this.state.password}
              onChange={this.handlePasswordChanged}
            />
            <p>Password Confirmation</p>
            <input
              type="password"
              className="form-control"
              value={this.state.password_confirmation}
              onChange={this.handlePasswordConfirmationChanged}
            />
          </div>
          <hr />
          <div className="action-panel">
            <span></span>
            <button id="btn_bet" onClick={this.handleSubmit}>
              Reset Password
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isDarkMode: state.auth.isDarkMode
});

const mapDispatchToProps = {
  resetPassword
};

export default connect(mapStateToProps, mapDispatchToProps)(ChangePasswordPage);
