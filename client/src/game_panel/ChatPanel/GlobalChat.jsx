import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Chat.css';
import PlayerModal from '../modal/PlayerModal';
import Avatar from '../../components/Avatar';
import {
  fetchId,
  acGetCustomerInfo
} from '../../redux/Customer/customer.action';

class GlobalChat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chat_list: [],
      fetchedGloabal: false,
      newMessages: 0,
      showTooltip: false,
      showPlayerModal: false,
      selectedCreator: '',
      mentionedUsers: {}
    };

    this.chatBoxRef = React.createRef();
  }

  componentDidMount() {
    if (this.chatBoxRef.current) {
      const offset = -150; // Replace 50 with your desired offset value
      this.chatBoxRef.current.scrollTop =
        this.chatBoxRef.current.scrollHeight + offset;
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.messages &&
      prevProps.messages.length < this.props.messages.length
    ) {
      this.setState(
        {
          newMessages: this.props.messages.length - prevProps.messages.length,
          showTooltip: true
        },
        () => console.log(this.state)
      );
    }
    if (this.chatBoxRef.current) {
      const offset = 50; // Replace 50 with your desired offset value
      this.chatBoxRef.current.scrollTop =
        this.chatBoxRef.current.scrollHeight + offset;
    }
  }

  static getDerivedStateFromProps(props, current_state) {
    if (!props.globalChatList) return null;
    if (current_state.chat_list.length !== props.globalChatList.length) {
      return {
        ...current_state,
        chat_list: props.globalChatList
      };
    }

    return null;
  }

  handleOpenPlayerModal = senderId => {
    // console.log('senderId', senderId)
    this.setState({ showPlayerModal: true, selectedCreator: senderId });
  };

  handleClosePlayerModal = () => {
    this.setState({ showPlayerModal: false });
  };

  handleMessageClick = message => {
    const { selectedMessage, setSelectedMessage } = this.props;

    if (selectedMessage.sender === message.sender) {
      // Deselect the message if it was already selected
      setSelectedMessage({
        sender: null,
        senderId: null,
        avatar: null,
        message: null,
        messageType: null,
        replyTo: null,
        time: null
      });
    } else {
      // Select the clicked message
      setSelectedMessage({
        sender: message.sender,
        senderId: message.senderId,
        avatar: message.avatar,
        message: message.message,
        messageType: message.messageType,
        replyTo: message.replyTo,
        time: message.time
      });
    }
  };

  render() {
    const { chat_list } = this.state;
    const { fetchId, emojis, selectedMessage } = this.props;

    return (
      <div className="chat-panel global-chat" ref={this.chatBoxRef}>
        {this.state.showTooltip && (
          <div className="msgtooltip">
            You have {this.state.newMessages} new message(s)
          </div>
        )}
        {this.state.showPlayerModal && (
          <PlayerModal
            selectedCreator={this.state.selectedCreator}
            modalIsOpen={this.state.showPlayerModal}
            closeModal={this.handleClosePlayerModal}
          />
        )}
        {chat_list.map((chat, key) => {
          const message = chat.message;
          const mentions = message.match(/@(\w+)/g);
          const wrappedMessage = message
            .split(/(@\w+|:\w+:)/g)
            .map((part, index) => {
              if (part.startsWith('@')) {
                const username = part.substring(1);
                const mentionedUser = this.state.mentionedUsers[username];

                if (mentionedUser && mentionedUser._id) {
                  // Render the link with _id if available
                  return (
                    <a
                      key={index}
                      className="player"
                      onClick={event => {
                        event.stopPropagation();
                        this.handleOpenPlayerModal(mentionedUser._id);
                      }}
                      
                    >
                      {part}
                    </a>
                  );
                } else if (mentionedUser && !mentionedUser._id) {
                  // Mentioned user exists but doesn't have an _id
                  return (
                    <span key={index} className="mention-link">
                      {part}
                    </span>
                  );
                } else {
                  // Fetch the _id for the mentioned user only if it's not already in the state
                  fetchId(username)
                    .then(id => {
                      const updatedMentionedUsers = {
                        ...this.state.mentionedUsers
                      };
                      updatedMentionedUsers[username] = { _id: id };
                      this.setState({ mentionedUsers: updatedMentionedUsers });
                    })
                    .catch(error => {
                      console.error(
                        `Error fetching _id for ${username}:`,
                        error
                      );
                    });

                  // Render the mention link without _id for now
                  return (
                    <span key={index} className="mention-link">
                      {part}
                    </span>
                  );
                }
              } else if (part.startsWith(':') && part.endsWith(':')) {
                const emojiCommand = part;
                const emoji = emojis.find(
                  emoji => emoji.command === emojiCommand
                );

                if (emoji) {
                  const { url, alt } = emoji;
                  return (
                    <img key={index} src={url} alt={alt} className="emoji" />
                  );
                }
              }
              return part;
            });

          // Handle replyTo message
          let wrappedReplyMessage = null;
          if (chat.replyTo && chat.replyTo.message) {
            const replyMessage = chat.replyTo.message;
            wrappedReplyMessage = replyMessage
              .split(/(@\w+|:\w+:)/g)
              .map((part, index) => {
                if (part.startsWith('@')) {
                  const username = part.substring(1);
                  const mentionedUser = this.state.mentionedUsers[username];

                  if (mentionedUser && mentionedUser._id) {
                    // Render the link with _id if available
                    return (
                      <a
                        key={index}
                        className="player"
                        onClick={event => {
                          event.stopPropagation();
                          this.handleOpenPlayerModal(mentionedUser._id);
                        }}
                        
                      >
                        {part}
                      </a>
                    );
                  } else if (mentionedUser && !mentionedUser._id) {
                    // Mentioned user exists but doesn't have an _id
                    return (
                      <span key={index} className="mention-link">
                        {part}
                      </span>
                    );
                  } else {
                    // Fetch the _id for the mentioned user only if it's not already in the state
                    fetchId(username)
                      .then(id => {
                        const updatedMentionedUsers = {
                          ...this.state.mentionedUsers
                        };
                        updatedMentionedUsers[username] = { _id: id };
                        this.setState({
                          mentionedUsers: updatedMentionedUsers
                        });
                      })
                      .catch(error => {
                        console.error(
                          `Error fetching _id for ${username}:`,
                          error
                        );
                      });

                    // Render the mention link without _id for now
                    return (
                      <span key={index} className="mention-link">
                        {part}
                      </span>
                    );
                  }
                } else if (part.startsWith(':') && part.endsWith(':')) {
                  const emojiCommand = part;
                  const emoji = emojis.find(
                    emoji => emoji.command === emojiCommand
                  );

                  if (emoji) {
                    const { url, alt } = emoji;
                    return (
                      <img key={index} src={url} alt={alt} className="emoji" />
                    );
                  }
                }
                return part;
              });
          }

          return (
            <div
              key={key}
              className={`chat-line ${
                selectedMessage === chat ? 'selected' : ''
              }`}
              onClick={() => this.handleMessageClick(chat)}
            >
              {chat.replyTo && chat.replyTo.sender && (
                <div className="reply-to">
                  <a
                    className="chat-player"
                    onClick={() =>
                      this.handleOpenPlayerModal(chat.replyTo.sender)
                    }
                  >
                    <div className="reply-border"></div>
                    <Avatar
                      className="avatar"
                      src={chat.replyTo.avatar}
                      alt=""
                      darkMode={this.props.isDarkMode}
                    />
                  </a>
                  <span className="reply-sender sender-name">
                    {chat.replyTo.sender}
                  </span>
                  <span className="reply-message chat-text">
                    {chat.replyTo.messageType === 'gif' ? (
                      <img
                        src={JSON.parse(chat.replyTo.message).content}
                        alt="gif"
                      />
                    ) : (
                      wrappedReplyMessage
                    )}
                  </span>
                  {/* <span className="reply-time chat-time">{chat.replyTo.time}</span> */}
                </div>
              )}
              <div className="chat-content">
                <a
                  className="chat-player"
                  onClick={() => this.handleOpenPlayerModal(chat.senderId)}
                >
                  <Avatar
                    className="avatar"
                    src={chat.avatar}
                    alt=""
                    darkMode={this.props.isDarkMode}
                  />
                </a>

                <div className="chat-msg">
                  <span className="sender-name">{chat.sender}</span>

                  <span className="chat-text">
                    {chat.messageType === 'gif' ? (
                      <img src={JSON.parse(chat.message).content} alt="gif" />
                    ) : (
                      wrappedMessage
                    )}
                  </span>
                </div>

                <div className="chat-time">
                  <div>{chat.time}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
const mapStateToProps = state => ({
  userName: state.auth.userName,
  isDarkMode: state.auth.isDarkMode,
  socket: state.auth.socket,
  globalChatList: state.logic.globalChatList
  // messages: state.yourMessagesState.messages
});

const mapDispatchToProps = {
  acGetCustomerInfo,
  fetchId
};

export default connect(mapStateToProps, mapDispatchToProps)(GlobalChat);
