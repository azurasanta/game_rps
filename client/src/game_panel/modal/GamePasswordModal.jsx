import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { setPasswordCorrect, closeGamePasswordModal } from '../../redux/Notification/notification.actions';
import { checkGamePassword } from '../../redux/Logic/logic.actions';
import { Button, TextField } from '@material-ui/core';
import { alertModal } from '../modal/ConfirmAlerts';

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

class GamePasswordModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            password: ''
        }
    }

    onBtnOkClicked = async (e) => {
        const response = await this.props.checkGamePassword({room_id: this.props.roomId, password: this.state.password});
        if (response === true) {
          const rooms = JSON.parse(localStorage.getItem("rooms")) || {};
          rooms[this.props.roomId] = true;
          localStorage.setItem("rooms", JSON.stringify(rooms));
          this.props.closeGamePasswordModal();
          this.props.setPasswordCorrect(true);
        } else {
          alertModal(
            this.props.isDarkMode,
            `WRONG F*CKING PASSWORD!`
          );
        }
      };
      
      
      

    onBtnCancelClicked = (e) => {
        this.props.closeGamePasswordModal();
    }

    render() {
        return <Modal
            isOpen={this.props.isOpen}
            style={customStyles}
            contentLabel="Password"
        >
            <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
                <div className='modal-body alert-body password-modal-body'>
                    <div className={`modal-icon result-icon-password`}></div>
                    <h5>PASSWORD REQUIRED</h5>
                    <TextField
                    type="password"
                    id="game_password"
                    variant="outlined"
                    value={this.state.password}
                    onChange={(e) => {this.setState({password: e.target.value})}}
                    className="form-control"
                    style={{marginBottom: '15px'}}
                    />
                    <Button className="btn-submit" onClick={this.onBtnOkClicked}>Continue Bet</Button>
                    <Button className="btn-back" onClick={this.props.closeGamePasswordModal}>Cancel</Button>
                </div>
            </div>
        </Modal>;
    }
}

const mapStateToProps = state => ({
    isDarkMode: state.auth.isDarkMode,
    isOpen: state.snackbar.showGamePasswordModal,
    title: state.snackbar.title,
    roomStatus: state.snackbar.roomStatus,
    alertMessage: state.snackbar.alertMessage,
    alertType: state.snackbar.alertType,
    socket: state.auth.socket,
    roomId: state.logic.curRoomInfo._id,
});

const mapDispatchToProps = {
    closeGamePasswordModal,
    checkGamePassword,
    setPasswordCorrect
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GamePasswordModal);
