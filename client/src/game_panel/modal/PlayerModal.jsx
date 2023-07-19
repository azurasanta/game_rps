import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { setChatRoomInfo } from '../../redux/Logic/logic.actions';
import history from '../../redux/history';
import { Button } from '@material-ui/core';

import { acGetCustomerInfo, getCustomerStatisticsData } from '../../redux/Customer/customer.action';
import Avatar from '../../components/Avatar';
import StatisticsForm from '../../admin_panel/app/Customer/EditCustomerPage/StatisticsForm';
import './Modals.css';


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
        background: 'transparent',
        padding: 0,
    }
}

class PlayerModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            _id: props.selectedCreator || '',
            username: '',
            avatar: '',
            loading: true,
            myChat: []

        }
    }
 
    handleOpenChat = (e) => {
        const selectedCreator = this.props.selectedCreator;
        const chatExists = this.state.myChat.find(chat => chat._id === selectedCreator);
      
        if (!chatExists) {
          // Handle case where chat does not exist
          const newChatRoom = {
            _id: selectedCreator,
            username: e.target.getAttribute('username'),
            avatar: e.target.getAttribute('avatar'),
            chatLogs: []
          };
          this.setState(prevState => ({
            myChat: [...prevState.myChat, newChatRoom]
          }));
          this.props.setChatRoomInfo(newChatRoom);
          history.push('/chat/' + selectedCreator);
        } else {
          // Handle case where chat exists
          this.props.setChatRoomInfo({
            avatar: e.target.getAttribute('avatar'),
            username: e.target.getAttribute('username'),
            chatLogs: chatExists.chatLogs
          });
          history.push('/chat/' + selectedCreator);
        }
      }
      
    
      
    async componentDidMount() {
        const result = await this.props.getCustomerStatisticsData(this.props.selectedCreator)
        const userData = await this.props.acGetCustomerInfo(this.props.selectedCreator)
        this.setState({
          ...result,
          username: userData.username,
          avatar: userData.avatar,
          loading: false
        })
    }
   

    handleCloseModal = () => {
        this.props.closeModal();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps._id !== this.props._id) {
            this.setState({ loading: true });
            this.props.getCustomerStatisticsData(nextProps._id)
                .then(result => this.setState({ ...result, loading: false }));
        }
    }

    render() {
        return (
            <Modal
                isOpen={this.props.modalIsOpen}
                onRequestClose={this.handleCloseModal}
                style={customStyles}
                contentLabel="Player Modal"
            >
                <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
                        <div className='modal-header'>
                        <h2 className="modal-title">Player Card</h2>
                        <Button className="btn-close" onClick={this.handleCloseModal}>×</Button>
                        </div>
                    <div className="modal-body edit-modal-body">
                        <div className='align-center'>

                            {this.state.loading ? (
                                <div className="loading-spinner"></div>
                                ) : (
                                    <Avatar
                                    src={this.state.avatar ? this.state.avatar : '/img/profile-thumbnail.svg'}
                                    alt=""
                                    />
                                    )}
                        </div>
                        {this.state.loading ? null : (
                            <div className="user-statistics">
                                <StatisticsForm
                                    username={this.state.username}
                                    joined_date={this.state.joined_date}
                                    gameLogList={this.state.gameLogList}
                                    deposit={this.state.deposit}
                                    withdraw={this.state.withdraw}
                                    gameProfit={this.state.gameProfit}
                                    balance={this.state.balance}
                                    gamePlayed={this.state.gamePlayed}
                                    totalWagered={this.state.totalWagered}
                                    netProfit={this.state.netProfit}
                                    profitAllTimeHigh={this.state.profitAllTimeHigh}
                                    profitAllTimeLow={this.state.profitAllTimeLow}
                                    getRoomStatisticsData={this.props.getRoomStatisticsData}
                                />
                                
                            </div>
                        )}
                    </div>
                    <div className='modal-footer'>
                                <Button className="send-msg" onClick={this.handleOpenChat}>Send Message</Button>
                            </div>
                </div>
            </Modal>
        )
    }
}


const mapStateToProps = state => ({
    isDarkMode: state.auth.isDarkMode,
    myChat: state.logic.myChat

});

const mapDispatchToProps = {
    getCustomerStatisticsData,
    acGetCustomerInfo,
    setChatRoomInfo
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PlayerModal);

