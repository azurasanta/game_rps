import React, { Component } from 'react';
import { connect } from 'react-redux';
import history from '../../redux/history';
import { getChatRoomInfo, addChatLog } from '../../redux/Logic/logic.actions';
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Avatar from "../../components/Avatar";
import { Button } from '@material-ui/core';

const moment = require('moment');

class ChatPage extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            chatLogs: this.props.chatLogs,
            my_info: this.props.my_info,
            text: '',
            socket: this.props.socket,
            showEmojiPanel: false,
        };
    }

    insertEmoji = (e) => {
        this.setState({text: this.state.text + e.target.innerHTML});
        this.textarea.focus();
    }

    onChangeText = (e) => {
        this.setState({text: e.target.value});
    }

    sendMessage = (e) => {
        const text = this.state.text.trim();

        if (text !== '') {
            const chatLog = {
                to: this.props.user_id,
                from: this.state.my_info._id,
                message: text,
                created_at: moment(new Date()).format('LLL'),
            };
            this.props.addChatLog(chatLog);
            this.state.socket.emit('SEND_CHAT', chatLog);
            this.setState({text : '', showEmojiPanel: false});
        }
    }

    onTextAreaKeyDown = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    static getDerivedStateFromProps(props, current_state) {
        return {
            ...current_state,
            chatLogs: props.chatLogs,
            my_info: props.my_info,
            socket: props.socket
        };
    }
    
    async componentDidMount() {
        this.IsAuthenticatedReroute();
        await this.props.getChatRoomInfo(this.props.match.params.id);
        this.state.socket.emit('REQUEST_UNREAD_MESSAGE_COUNT', {to: this.state.my_info._id});
    }
    

    componentDidUpdate() {
        this.chat_log_panel.scrollTop = this.chat_log_panel.scrollHeight;
    }
    
    IsAuthenticatedReroute = () => {
        if (!this.props.auth) {
            history.push('/');
        }
    };

    render() {
        return (
			<div className="chat-page">
                <div className="chat-header">
                    <Button className="btn-back" onClick={()=>{history.push('/')}}>Go Back</Button>
                    <span>{this.props.username}</span>
                </div>
                <div className="chat-log-panel" ref={(elem) => {this.chat_log_panel = elem}}>
                    {this.state.chatLogs.map((row, key) => (
                        <div className={row.from === this.state.my_info._id ? 'my-message': 'other-message'} key={key}>
                            <div className="message-content">
                                {row.message}
                            </div>
                            <div className="message-header">
                                {row.from !== this.state.my_info._id && <Avatar src={this.props.avatar} className="avatar" />}
                                <div>
                                    <div className="message-time">{row.created_at}</div>
                                    <div className="message_username">{row.from === this.state.my_info._id ? this.state.my_info.username : this.props.username}</div>
                                </div>
                                {row.from === this.state.my_info._id && <Avatar src={this.state.my_info.avatar} className="avatar" />}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={`chat-input-panel ${this.state.showEmojiPanel ? 'show-emoji' : ''}`}>
                    <div className={`emoticon-panel ${this.state.showEmojiPanel ? 'active' : ''}`}>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🤬</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🖕</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🖕🏿</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🖕🏽</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🖕🏻</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>😭</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🤔</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🤑</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🤣</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>😎</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>😏</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>☔️</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🏆</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🎁</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🎯</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>❤</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>😩</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>😍</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>😊</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>☠</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🔥</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🏝</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🚀</span>
                        <span role="img" aria-label="" onClick={this.insertEmoji}>🥩</span>
                    </div>
                    <Button className="btn-show-emoticon" onClick={() => {this.setState({showEmojiPanel: !this.state.showEmojiPanel})}}></Button>
                    <input type="text" className="form-control" placeholder="Chat here..." onKeyDown={this.onTextAreaKeyDown} onChange={this.onChangeText} value={this.state.text} ref={(elem) => {this.textarea = elem}} />
                    <Button className="btn-send-message" onClick={this.sendMessage}><FontAwesomeIcon icon={faPaperPlane} /></Button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
  auth: state.auth.isAuthenticated,
  my_info: state.auth.user,
  socket: state.auth.socket,
  user_id: state.logic.chatRoomInfo.user_id,
  avatar: state.logic.chatRoomInfo.avatar,
  username: state.logic.chatRoomInfo.username,
  chatLogs: state.logic.chatRoomInfo.chatLogs,
});

const mapDispatchToProps = {
    getChatRoomInfo,
    addChatLog
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatPage);
