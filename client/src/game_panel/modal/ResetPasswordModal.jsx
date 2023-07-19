import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import './Modals.css';

import { sendResetPasswordEmail } from '../../redux/Auth/user.actions';

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
        border: 0
    }
}

class ResetPasswordModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: props.email,
            password: props.password,
            showVerificationModal: false
        }
    }

    onChangeEmail = (e) => {
        this.setState({email: e.target.value});
    }

    onSubmitForm = async (e) => {
        e.preventDefault();
        const is_sent = await this.props.sendResetPasswordEmail(this.state.email);
        if (is_sent) {
        }
    }

    render() {
        return (
            <>
                <Modal
                    isOpen={this.props.modalIsOpen}
                    style={customStyles}
                    contentLabel={this.props.title}
                >
                    <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
                        <div className="modal-body">
                            <button className="btn-close" onClick={this.props.closeModal}>×</button>
                            <h2>RECOVER PASSWORD</h2>
                            <form onSubmit={this.onSubmitForm}>
                                <p>YOUR EMAIL ADDRESS</p>
                                <input type="text" className="form-control" value={this.state.email} onChange={this.onChangeEmail} />
                                <button className="btn-submit">Send Email</button>
                                <p className="m-0 sm-text-center"><button onClick={(e) => { this.props.closeModal(); this.props.openLoginModal(); }}>Back to Login →</button></p>
                            </form>
                        </div>
                    </div>
                </Modal>
            </>
        );
    }
}

const mapStateToProps = state => ({
    isDarkMode: state.auth.isDarkMode,
});

const mapDispatchToProps = {
    sendResetPasswordEmail
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ResetPasswordModal);
