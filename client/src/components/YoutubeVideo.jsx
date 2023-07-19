import React from 'react';
import { Slider } from '@material-ui/core/';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';

export class YouTubeVideo extends React.Component {
  constructor(props) {
    super(props);
    this.player = null;
    this.state = {
      isPlaying: true,
      volume: 50, // Initial volume value
      videoTitle: '' // Holds the video title
    };
  }

  onYouTubeIframeAPIReady = () => {
    const { url } = this.props;
    const videoId = extractVideoId(url); // Function to extract video ID from URL

    this.player = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        showinfo: 0,
        rel: 0,
        loop: 1,
        playlist: videoId // Set the playlist to the current video ID for looping
      },
      events: {
        onReady: this.onPlayerReady,
        onStateChange: this.onPlayerStateChange
      }
    });

    // Fetch the video details using YouTube Data API
    this.fetchVideoDetails(videoId);
  };

  onPlayerReady = event => {
    event.target.playVideo(); // Play the video programmatically
  };

  onPlayerStateChange = event => {
    if (event.data === window.YT.PlayerState.ENDED) {
      event.target.playVideo(); // Play the video again when it ends
    }
  };

  handlePlayPause = () => {
    if (this.player && this.player.pauseVideo) {
      if (this.state.isPlaying) {
        this.player.pauseVideo();
      } else {
        this.player.playVideo();
      }
      this.setState(prevState => ({
        isPlaying: !prevState.isPlaying
      }));
    }
  };
  

  handleVolumeChange = (event, value) => {
    this.player.setVolume(value); // Set the volume of the video
    this.setState({
      volume: value // Update the volume state
    });
  };

  fetchVideoDetails = async videoId => {
    const apiKey = 'AIzaSyAc_yDOErOvwY6gkRnJERq-xTQq4Z6ic5Q';
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.items.length > 0) {
        const videoTitle = data.items[0].snippet.title;
        this.setState({ videoTitle });
      }
    } catch (error) {
      console.log('Error fetching video details:', error);
    }
  };

  componentDidMount() {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady;
    } else {
      this.onYouTubeIframeAPIReady();
    }
  }
  

  render() {
    const containerStyle = {
      position: 'relative' // 16:9 aspect ratio (change based on your aspect ratio)
    };

    const overlayStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    };

    const controlsStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative' // Added to control the position of the slider
    };

    const sliderStyle = {
      color: 'red'
    };

    return (
      <div style={containerStyle}>
        <div style={overlayStyle}>
          <div id="youtube-player" style={{ display: 'none' }}></div>
          <div style={controlsStyle}>
            <div className="ticker-container">
              <p className="ticker-text">{this.state.videoTitle}</p>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center'
              }}
            >
              <IconButton
                onClick={this.handlePlayPause}
                className="music-controls"
              >
                {this.state.isPlaying ? (
                  <PauseIcon style={{ fontSize: '12px' }} />
                ) : (
                  <PlayArrowIcon style={{ fontSize: '12px' }} />
                )}
              </IconButton>

              <Slider
                value={this.state.volume}
                onChange={this.handleVolumeChange}
                min={0}
                max={100}
                style={sliderStyle}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function extractVideoId(url) {
  const regex = /[?&]v=([^?&]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}
