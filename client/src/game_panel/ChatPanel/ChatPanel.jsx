import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import Moment from 'moment';
// import { alertModal } from '../modal/ConfirmAlerts';
import Avatar from '../../components/Avatar';
import {
  Tabs,
  Tab,
  Button,
  InputAdornment,
  TextField,
} from '@material-ui/core';
import { InsertEmoticon, Gif, Clear } from '@material-ui/icons';
import GlobalChat from './GlobalChat';
import MyChat from './MyChat';
import Chat from '../icons/Chat.js';
import ChatHover from '../icons/ChatHover';
import ChatRoom from '../icons/ChatRoom';
import ChatRoomHover from '../icons/ChatRoomHover.js';

function updateFromNow(history) {
  const result = JSON.parse(JSON.stringify(history));
  for (let i = 0; i < result.length; i++) {
    result[i]['from_now'] = Moment(result[i]['created_at']).fromNow();
  }
  return result;
}

const emojis = [
  { command: ':dance:', url: '/img/emotes/dance.webp', alt: 'pepedance' },
  { command: ':goofy:', url: '/img/emotes/goofy.webp', alt: 'goofy' },
  { command: ':salute:', url: '/img/emotes/salute.webp', alt: 'salute' },
  { command: ':happy:', url: '/img/emotes/happy.webp', alt: 'happy' },
  { command: ':sus:', url: '/img/emotes/sus.webp', alt: 'sus' },
  { command: ':pepedance:', url: '/img/emotes/pepepe.webp', alt: 'pepedance' },
  {
    command: ':wellyousee:',
    url: '/img/emotes/wellyousee.webp',
    alt: 'wellyousee'
  },
  { command: ':laugh:', url: '/img/emotes/laugh.webp', alt: 'laugh' },
  {
    command: ':randomemote:',
    url: '/img/emotes/randomemote.webp',
    alt: 'randomemote'
  },
  { command: ':sadthink:', url: '/img/emotes/sadthink.webp', alt: 'sadthink' },
  { command: ':alien:', url: '/img/emotes/alien.webp', alt: 'alien' },
  { command: ':pog:', url: '/img/emotes/pog.webp', alt: 'pog' },
  { command: ':babycar:', url: '/img/emotes/babycar.webp', alt: 'babycar' },
  { command: ':dababy:', url: '/img/emotes/dababy.webp', alt: 'dababy' },
  { command: ':dababyw:', url: '/img/emotes/dababyw.webp', alt: 'dababyw' },
  { command: ':poggies:', url: '/img/emotes/poggies.webp', alt: 'poggies' },
  { command: ':angry:', url: '/img/emotes/angry.webp', alt: 'angry' },
  { command: ':pepesad:', url: '/img/emotes/pepesad.webp', alt: 'pepesad' },
  { command: ':cry:', url: '/img/emotes/cry.webp', alt: 'cry' },
  { command: ':wutdog:', url: '/img/emotes/wutdog.webp', alt: 'wutdog' },
  { command: ':wut:', url: '/img/emotes/wut.webp', alt: 'wut' },
  { command: ':pogger:', url: '/img/emotes/pogger.webp', alt: 'pogger' },
  { command: ':nocap:', url: '/img/emotes/nocap.webp', alt: 'nocap' },
  { command: ':mike:', url: '/img/emotes/mike.webp', alt: 'mike' },
  { command: ':kekw:', url: '/img/emotes/kekw.webp', alt: 'kekw' },
  { command: ':butwhy:', url: '/img/emotes/butwhy.webp', alt: 'butwhy' },
  { command: ':doge:', url: '/img/emotes/doge.webp', alt: 'doge' },
  { command: ':3head:', url: '/img/emotes/3head.webp', alt: '3head' },
  { command: ':cross:', url: '/img/emotes/cross.webp', alt: 'cross' },
  { command: ':check:', url: '/img/emotes/check.webp', alt: 'check' },
  { command: ':pepetypo:', url: '/img/emotes/pepetypo.webp', alt: 'pepetypo' },
  { command: ':kirby:', url: '/img/emotes/kirby.webp', alt: 'kirby' },
  { command: ':wow:', url: '/img/emotes/wow.webp', alt: 'wow' },
  { command: ':cat:', url: '/img/emotes/cat.webp', alt: 'cat' },
  {
    command: ':moneypepe:',
    url: '/img/emotes/moneypepe.webp',
    alt: 'moneypepe'
  },
  { command: ':truemf:', url: '/img/emotes/truemf.webp', alt: 'truemf' },
  { command: ':hattip:', url: '/img/emotes/hattip.webp', alt: 'hat tip' },
  { command: ':simp:', url: '/img/emotes/simp.webp', alt: 'simp' },
  { command: ':1x:', url: '/img/emotes/1x.webp', alt: '1x' },
  { command: ':fortnite:', url: '/img/emotes/fortnite.webp', alt: 'fortnite' },
  { command: ':pepenou:', url: '/img/emotes/pepenou.webp', alt: 'pepenou' },
  { command: ':ain:', url: '/img/emotes/ain.webp', alt: 'ain' },
  { command: ':troll:', url: '/img/emotes/troll.webp', alt: 'troll' },
  {
    command: ':minecraftcookie:',
    url: '/img/emotes/minecraftcookie.webp',
    alt: 'minecraftcookie'
  }
];

const customStyles = {
  tabRoot: {
    minWidth: '50%',
    textTransform: 'none'
  }
};

class ChatPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected_tab_index: 1,
      text: '',
      showEmojiPanel: false,
      showSearchPopup: false,
      gifs: [],
      emojis: {},
      selectedMessage: {
        sender: null,
        avatar: null,
        message: null,
        messageType: null,
        time: null
      }
    };
  }
  onTextAreaKeyDown = e => {
    if (!this.props.socket) return;
  
    if (e.keyCode === 13) {
      e.preventDefault();
      const text = this.state.text.trim();
  
      if (text !== '') {
        const { selectedMessage } = this.state;
        this.props.socket.emit('GLOBAL_CHAT_SEND', {
          sender: this.props.userName,
          senderId: this.props.user._id,
          message: text,
          avatar: this.props.user.avatar,
          replyTo: selectedMessage // Include the selected message details
        });
        this.handleClearTooltip();
      }
    }
  };
  
  handleClearTooltip = () => {
    this.setState({
      selectedMessage: {
        sender: null,
        avatar: null,
        message: null,
        messageType: null,
        time: null,
        showEmojiPanel: false
      },
      text: '' // Clear the text field input by updating the 'text' state
    });
  };
  

  handleMouseEnter = index => {
    this.setState({ hoverTabIndex: index });
  };

  handleMouseLeave = () => {
    this.setState({ hoverTabIndex: -1 });
  };

  handleGifClick = gifUrl => {
    if (this.props.socket) {
      // Send the clicked GIF to the chat
      const message = {
        type: 'gif',
        content: gifUrl
      };

      this.props.socket.emit('GLOBAL_CHAT_SEND', {
        sender: this.props.userName,
        senderId: this.props.user._id,
        message: JSON.stringify(message),
        avatar: this.props.user.avatar,
        messageType: 'gif'
      });

      // Close the search popup and clear the search input
      this.setState({ showSearchPopup: false, searchInput: '' });
    }
  };

  insertEmoji = emojiCommand => {
    const emoji = emojis.find(emoji => emoji.command === emojiCommand);

    if (emoji) {
      const { command, url, alt } = emoji;
      const updatedText = this.state.text + `${command}`;
      this.setState({ text: updatedText });
      this.textarea.focus();
    }
  };

  setSelectedMessage = message => {
    this.setState({ selectedMessage: message });
  };

  onChangeText = e => {
    this.setState({ text: e.target.value });
  };

  handleTabChange = (event, newValue) => {
    this.setState({ selected_tab_index: newValue });
  };

  

  toggleEmojiPanel = () => {
    this.setState(prevState => ({
      showEmojiPanel: !prevState.showEmojiPanel
    }));
  };

  toggleSearchPopup = () => {
    this.setState(prevState => ({
      showSearchPopup: !prevState.showSearchPopup
    }));
  };

  renderSearchPopup() {
    return (
      <div
        className={`search-popup ${this.state.showSearchPopup ? 'active' : ''}`}
      >
        {this.state.showSearchPopup && (
          <>
            {/* Search input */}
            <div style={{ marginBottom: '10px' }}>
              <TextField
                type="text"
                placeholder="Search GIFs..."
                variant="outlined"
                onKeyDown={this.onTextAreaKeyDown}
                onChange={this.handleSearchInputChange}
              />
            </div>

            {/* Display the searched GIFs */}
            <div className="gif-results">
              {this.state.gifs.map(gif => (
                <img
                  key={gif.id}
                  src={gif.images.fixed_height.url}
                  alt={gif.title}
                  onClick={() =>
                    this.handleGifClick(gif.images.fixed_height.url)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  handleSearchInputChange = async event => {
    const searchTerm = event.target.value;
    const apiKey = 'EoYYQ1kbX7mRfqwJ6xC4M6wgQmds4Dq1'; // Replace with your Giphy API key
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${searchTerm}`;

    try {
      const response = await axios.get(url);
      const gifs = response.data.data;
      this.setState({ gifs });
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    }
  };

  render() {
    const {
      selectedMessage,
      selected_tab_index,
      hoverTabIndex,
      showEmojiPanel
    } = this.state;
    const { selectedMainTabIndex } = this.props;
    return (
      <div className="chat-wrapper">
        <Tabs
          value={selected_tab_index}
          onChange={this.handleTabChange}
          TabIndicatorProps={{ style: { background: '#ff0000' } }}
          className="main-game-page-tabs"
        >
          <Tab
            className={`custom-tab ${
              hoverTabIndex === 0 || selectedMainTabIndex === 0
                ? 'fade-animation fade-in'
                : 'fade-animation fade-out'
            }`}
            label="Inbox"
            labelPlacement="left"
            icon={
              hoverTabIndex === 0 || selected_tab_index === 0 ? (
                <ChatHover />
              ) : (
                <Chat />
              )
            }
            style={customStyles.tabRoot}
            onMouseEnter={() => this.handleMouseEnter(0)}
            onMouseLeave={this.handleMouseLeave}
          />
          <Tab
            className={`custom-tab ${
              hoverTabIndex === 0 || selectedMainTabIndex === 0
                ? 'fade-animation fade-in'
                : 'fade-animation fade-out'
            }`}
            label="Chat"
            labelPlacement="left"
            icon={
              hoverTabIndex === 1 || selected_tab_index === 1 ? (
                <ChatRoomHover />
              ) : (
                <ChatRoom />
              )
            }
            style={customStyles.tabRoot}
            onMouseEnter={() => this.handleMouseEnter(1)}
            onMouseLeave={this.handleMouseLeave}
          />
        </Tabs>
        {selected_tab_index === 0 ? (
          <MyChat />
        ) : (
          <GlobalChat
          emojis={emojis}
            setSelectedMessage={this.setSelectedMessage}
            selectedMessage={selectedMessage}
          />
        )}
        {selected_tab_index === 1 && (
          <div className="chat-input-panel">
            {selectedMessage && selectedMessage.sender &&(
              <div className="tooltip reply">
                <div className="tooltip-content">
                  Replying to:
                  <div className="tooltip-avatar">
                    <Avatar src={selectedMessage.avatar} alt="Avatar" />
                  </div>
                  {selectedMessage.sender}
                  <Button  className="tooltip-cross">

                  <Clear onClick={this.handleClearTooltip} />
                  </Button>

                </div>
              </div>
            )}
            {this.renderSearchPopup()}
            <div className={`emoticon-panel ${showEmojiPanel ? 'active' : ''}`}>
              {emojis.map(emoji => (
                <img
                  key={emoji.command}
                  src={emoji.url}
                  alt={emoji.alt}
                  onClick={() => this.insertEmoji(emoji.command)}
                />
              ))}
            </div>
            <TextField
              type="text"
              className="form-control"
              variant="outlined"
              onKeyDown={this.onTextAreaKeyDown}
              placeholder="Chat here..."
              onChange={this.onChangeText}
              value={this.state.text}
              ref={elem => {
                this.textarea = elem;
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment
                    position="end"
                    style={{ minWidth: '60px', background: 'transparent' }}
                  >
                    <Button
                      className="btn-show-emoticon"
                      onClick={this.toggleEmojiPanel}
                      style={{ minWidth: '32px'}}
                    >
                      <InsertEmoticon style={{ fontSize: '16px' }} />
                    </Button>
                    <Button
                      className="btn-search-gifs"
                      onClick={this.toggleSearchPopup}
                      style={{ minWidth: '32px', marginLeft: '2px'}}
                    >
                      <Gif style={{ fontSize: '32px' }} />
                    </Button>
                  </InputAdornment>
                )
              }}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  isDarkMode: state.auth.isDarkMode,
  userName: state.auth.userName,
  user: state.auth.user,
  socket: state.auth.socket
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ChatPanel);
