import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import './Modals.css';

import { userSignOut, verifyEmail, resendVerificationEmail } from '../../redux/Auth/user.actions';

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
        background: 'transparent'
    }
}

class VerificationModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            verificationCode: ''
        }
    }

    onChangeVerificationCode = (e) => {
        this.setState({verificationCode: e.target.value});
    }

    componentDidMount() {
    }

    onSubmitForm = async (e) => {
        e.preventDefault();
        const is_verified = await this.props.verifyEmail(this.state.verificationCode);
        if (is_verified) {
            this.props.closeModal();
        }
    }

    handleBtnResendClicked = (e) => {
        e.preventDefault();
        this.props.resendVerificationEmail();
    }

    render() {
        return (
            <Modal
                isOpen={this.props.modalIsOpen}
                style={customStyles}
                contentLabel={this.props.title}
            >
                <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
                    <div className="modal-body">
                        <button className="btn-close" onClick={(e) => { 
                            e.preventDefault();
                            this.props.userSignOut();
                            this.props.closeModal();
                        }}>×</button>
                        <h4>Verification code sent</h4>
                        <h2>Please check your email</h2>
                        <form onSubmit={this.onSubmitForm}>
                            <p>Enter your verification code</p>
                            <input type="text" className="form-control" value={this.state.verificationCode} onChange={this.onChangeVerificationCode} />
                            <button className="btn-submit" type="submit">Confirm</button>
                            <button className="btn-back" type="button" onClick={(e) => { 
                                e.preventDefault();
                                this.props.userSignOut();
                                this.props.closeModal();
                            }}>Go Back</button>
                            <p className="m-0 sm-text-center">Not received yet? <button type="button" onClick={this.handleBtnResendClicked}>Resend Code →</button></p>
                        </form>
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
    userSignOut,
    verifyEmail,
    resendVerificationEmail
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VerificationModal);
