import React, { Component } from 'react';
import { TwitterShareButton, TwitterIcon } from 'react-share';
import { FaClipboard } from 'react-icons/fa';

const styles = {
  focused: {
    borderColor: '#fa3fa0'
  }
};

export default class Share extends Component {
  constructor(props) {
    super(props);

    this.settingsRef = React.createRef();
    this.socket = this.props.socket;
    this.state = {
      betting: false,
      clicked: true,
      copied: false,
    };
  }

  toggleBtnHandler = () => {
    this.setState({
      clicked: !this.state.clicked,
      text: 'LINK GRABBED'
    });
    setTimeout(() => {
      this.setState({
        clicked: !this.state.clicked,
        text: ''
      });
    }, 1000);
  };
 

  copy() {
    const twitterLink = 'https://rps.game/join/' + this.props.roomInfo._id;
    navigator.clipboard.writeText(twitterLink);
  }

  render() {
    const styles = ['copy-btn'];
    let text = 'COPY CONTRACT';

    if (this.state.clicked) {
      styles.push('clicked');
      text = 'COPIED!';
    }

    const twitterLink = 'https://rps.game/join/' + this.props.roomInfo._id;
    
    return (
      <div className="share-options">
        <TwitterShareButton
          url={twitterLink}
          title={`Challenge my AI, p*ssy: ⚔`} // ${this.props.roomInfo.room_name}
          className="Demo__some-network__share-button"
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        <a
          className={styles.join('')}
          onClick={() => {
            this.toggleBtnHandler();
            this.copy();
          }}
        >
          {this.state.clicked ? (
            <input
              type="text"
              value={twitterLink}
              readOnly
              onClick={this.toggleBtnHandler}
            />
          ) : null}
          <FaClipboard />
          &nbsp;{this.state.text}
        </a>
      </div>
    );
  }
}
