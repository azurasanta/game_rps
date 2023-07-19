import React, { Component } from 'react';
import { connect } from 'react-redux';
import TabbedContent from '../../components/TabbedContent';
import Moment from 'moment';
import { Button, Drawer } from '@material-ui/core';
import LoadingOverlay from 'react-loading-overlay';
import { toggleDrawer } from '../../redux/Auth/user.actions';
import RPS from '../JoinGame/RPS';
import Blackjack from '../JoinGame/Blackjack';
import Spleesh from '../JoinGame/Spleesh';
import MysteryBox from '../JoinGame/MysteryBox';
import BrainGame from '../JoinGame/BrainGame';
import QuickShoot from '../JoinGame/QuickShoot';
import DropGame from '../JoinGame/DropGame';
import Bang from '../JoinGame/Bang';
import Roll from '../JoinGame/Roll';
import {
  bet,
  getRoomInfo,
  setCurRoomInfo,
  loadRoomInfo,
  getMyChat,
  getMyGames,
  getMyHistory,
  getHistory,
  getGameTypeList
} from '../../redux/Logic/logic.actions';
import ChatPanel from '../ChatPanel/ChatPanel';
import { Tabs, Tab } from '@material-ui/core';
import MyGamesTable from '../MyGames/MyGamesTable';
import MyHistoryTable from '../MyGames/MyHistoryTable';
import Lottie from 'react-lottie';
import animationData from '../LottieAnimations/live';
import HistoryTable from '../LiveGames/HistoryTable';
import DrawerButton from './DrawerButton';
import Footer from './Footer';
import { toggleMute } from '../../redux/Auth/user.actions';

function updateFromNow(history) {
  const result = JSON.parse(JSON.stringify(history));
  for (let i = 0; i < result.length; i++) {
    result[i]['from_now'] = Moment(result[i]['created_at']).fromNow();
  }
  return result;
}

const customStyles = {
  tabRoot: {
    textTransform: 'none',
    width: '50%',
    // height: '48px'
  }
};

const gifUrls = [
  'https://uploads-ssl.webflow.com/6097a2499efec713b2cb1c07/641ef8e1ce09cd9cf53a4829_rock1.gif',
  'https://uploads-ssl.webflow.com/6097a2499efec713b2cb1c07/641ef98d7e17a610c3ed83b9_paper2.gif',
  'https://uploads-ssl.webflow.com/6097a2499efec713b2cb1c07/641efdcadd850ab47a768e04_scissors1.gif'
];

const getRandomGifUrl = () => {
  const randomIndex = Math.floor(Math.random() * gifUrls.length);
  return gifUrls[randomIndex];
};

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

class JoinGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_mobile: window.innerWidth < 1024 ? true : false,
      selectedMobileTab: 'live_games',
      joiningRoom: false,
      roomInfo: this.props.roomInfo,
      bankroll:
        parseFloat(this.props.roomInfo.bet_amount) - this.getPreviousBets(),
      history: this.props.history,
      loading: false,
      sounds: {
        win: new Audio('/sounds/win-sound.mp3'),
        split: new Audio('/sounds/split-sound.mp3'),
        lose: new Audio('/sounds/lose-sound.mp3'),
        start: new Audio('/sounds/start.mp3'),
        countDown: new Audio('/sounds/countDown.mp3'),
        stop: new Audio('/sounds/stop.mp3'),
        sweep: new Audio('/sounds/sweep.mp3'),
        select: new Audio('/sounds/select.mp3'),
        wrong: new Audio('/sounds/wrong.mp3'),
        correct: new Audio('/sounds/correct.mp3'),
        bang: new Audio('/sounds/bang.mp3'),
        shine: new Audio('/sounds/shine.mp3'),
        cards: new Audio('/sounds/card.mp3'),
        // fuse: new Audio('/sounds/fuse.mp3'),
      },
      currentSound: null,
    };

    this.toggleDrawer = this.toggleDrawer.bind(this);
  }

  static getDerivedStateFromProps(props, current_state) {
    if (
      current_state.history?.length === 0 ||
      (props.history &&
        current_state.history[0]['created_at'] !==
          props.history[0]['created_at'])
    ) {
      return {
        ...current_state,
        history: updateFromNow(props.history)
      };
    }
    if (current_state.roomInfo._id !== props.roomInfo._id) {
      return {
        roomInfo: props.roomInfo
        // bankroll: props.roomInfo.bet_amount - this.getPreviousBets()
      };
    }

    return null;
  }

  componentDidMount() {
    this.setState({ loading: true });

  setTimeout(() => {
    this.setState({ loading: false });
  }, 2000);
    window.addEventListener('unload', this.handleUnload);

    Object.values(this.state.sounds).forEach(sound => {
      sound.load();
    });
    this.props.getHistory();
    this.props.getGameTypeList();
    if (this.props.isAuthenticated) {
      this.props.getMyGames();
      this.props.getMyHistory();
      this.props.getMyChat();
    }
    this.props.getRoomInfo(this.props.match.params.id);
  }
  handleUnload = () => {
    this.stopAllSounds();
  }

  componentWillUnmount() {
    window.removeEventListener('unload', this.handleUnload);

    clearInterval(this.interval);
  }

  stopAllSounds = () => {
    const { currentSound } = this.state;
    if (currentSound) {
      currentSound.pause();
      currentSound.currentTime = 0;
      this.setState({ currentSound: null });
    }
  }


  toggleDrawer = () => {
    this.props.toggleDrawer(!this.props.isDrawerOpen);
  };

  componentDidUpdate(prevProps) {
    if (prevProps.history !== this.props.history) {
      this.setState({ history: updateFromNow(this.props.history) });
    }
    if (this.props.match.params.id !== prevProps.match.params.id) {
      if (this.props.isAuthenticated) {
        if (this.props.roomInfo.status !== 'finished') {
          this.refreshHistory();
        }
      }
    }
  }

  updateReminderTime = () => {
    this.setState({ history: updateFromNow(this.state.history) });
  };

  getPreviousBets() {
    let previousBets = 0;
    if (this.props.roomInfo && this.props.roomInfo.game_log_list) {
      this.props.roomInfo.game_log_list.forEach(room_history => {
        if (room_history.bet_amount) {
          previousBets += parseFloat(room_history.bet_amount);
        }
      });
    }
    return previousBets;
  }

  join = async betInfo => {
    this.setState({ joiningRoom: true });
    // await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await this.props.bet({
      _id: this.state.roomInfo._id,
      game_type: this.props.roomInfo.game_type,
      ...betInfo
    });

    this.setState({ joiningRoom: false });

    return result;
  };

  playSound = sound => {
    if (!this.props.isMuted) {
      const audio = this.state.sounds[sound];
      if (!audio.paused) {
        return; // Sound is already playing, so just return
      }
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log(`Error playing sound "${sound}":`, error);
        });
      }
      this.setState({ currentSound: audio }); // Store a reference to the currently playing sound
    }
  };
  
  playSoundLoop = sound => {
    if (!this.props.isMuted) {
      const audio = this.state.sounds[sound];
      if (audio.paused) { // Check if the sound is not already playing
        audio.currentTime = 3; // Set the starting time to 3 seconds
        audio.loop = true; // Enable looping
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log(`Error playing sound "${sound}":`, error);
          });
        }
        this.setState({ currentSound: audio }); // Store a reference to the currently playing sound
      }
    }
  };
  
  // fadeOutSound = () => {
  //   const { currentSound } = this.state;
  //   if (currentSound) {
  //     const fadeOutInterval = setInterval(() => {
  //       currentSound.volume -= 0.1;
  //       if (currentSound.volume <= 0.1) {
  //         clearInterval(fadeOutInterval);
  //         currentSound.pause();
  //         currentSound.currentTime = 0;
  //         currentSound.volume = 1;
  //         this.setState({ currentSound: null }); // Clear the reference to the currently playing sound
  //       }
  //     }, 100);
  //   }
  // };
  
  stopSound = (sound) => {
    
    const { currentSound } = this.state;
    // console.log("stop", currentSound);
    if (currentSound && currentSound.src.includes(sound)) {
      currentSound.pause();
      currentSound.currentTime = 0;
      this.setState({ currentSound: null }); // Clear the reference to the currently playing sound
    }
  };
  
  
  refreshHistory = () => {
    this.props.getRoomInfo(this.props.match.params.id);
  };

  showOpenGameOrHistory = (e, newValue) => {
    e.preventDefault();
    this.setState({
      show_open_game: newValue
    });
  };

  getActiveTabText = () =>
    (this.state.is_mobile && this.state.selectedMobileTab === 'live_games') ||
    (!this.state.is_mobile && this.props.selectedMainTabIndex === 0) ? (
      <div id="liveStakes">
        {this.props.roomCount} LIVE BATTLES
        <Lottie options={defaultOptions} width={40} />
      </div>
    ) : (
      'My Battles'
    );

  render() {
    const { open } = this.props;
    const { joiningRoom, loading } = this.state;

    return (
      <>
        <LoadingOverlay
          className="custom-loading-overlay"
          active={loading || joiningRoom}
          spinner={
            <div className="rpsLoader">
              <img
                src={getRandomGifUrl()}
                alt="Random Spinner"
                style={{
                  width: '40px',
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginBottom: '10px'
                }}
              />
      <div>{loading ? 'Joining Room...' : 'Please wait...'}</div>
            </div>
          }
        >
          <div
            className="main-game"
            style={{
              gridTemplateColumns: this.props.isDrawerOpen
                ? '260px calc(100% - 610px) 350px'
                : 'calc(100% - 350px) 350px'
            }}
          >
            {((this.state.is_mobile &&
              this.state.selectedMobileTab === 'chat') ||
              !this.state.is_mobile) && (
              <Drawer
                className="mat-chat"
                style={{ display: this.props.isDrawerOpen ? 'flex' : 'none' }}
                variant="persistent"
                anchor="left"
                open={this.props.isDrawerOpen}
              >
                <ChatPanel />
              </Drawer>
            )}
            {!this.state.is_mobile &&
              (!this.state.selectedMobileTab === 'live_games' ||
                !this.state.selectedMobileTab === 'my_games') && (
                <Tabs
                  value={this.state.show_open_game}
                  onChange={this.showOpenGameOrHistory}
                  TabIndicatorProps={{ style: { background: '#ff0000' } }}
                  className="main-game-page-tabs"
                >
                  <Tab
                    label={
                      this.state.selectedMobileTab === 'live_games'
                        ? 'Live Battles'
                        : 'My Battles'
                    }
                    style={customStyles.tabRoot}
                  />
                  <Tab label="History" style={customStyles.tabRoot} />
                </Tabs>
              )}

            <div className="main-panel">
              <div className="join-game-panel">
                {this.props.roomInfo.game_type === 'RPS' && (
                  <RPS
                    refreshHistory={this.refreshHistory}
                    playSound={this.playSound}
                    join={this.join}
                    roomInfo={this.props.roomInfo}
                    user_id={this.props.user_id}
                    creator_id={this.props.roomInfo.creator_id}
                    bet_amount={this.props.roomInfo.bet_amount}
                    bankroll={this.state.bankroll}
                    rps_bet_item_id={this.props.roomInfo.rps_bet_item_id}
                    is_private={this.props.roomInfo.is_private}
                    youtubeUrl={this.props.roomInfo.youtubeUrl}
                  />
                )}
                {this.props.roomInfo.game_type === 'Spleesh!' && (
                  <Spleesh
                    refreshHistory={this.refreshHistory}
                    join={this.join}
                    spleesh_bet_unit={this.props.roomInfo.spleesh_bet_unit}
                    game_log_list={this.props.roomInfo.game_log_list || []}
                    user_id={this.props.user_id}
                    creator_id={this.props.roomInfo.creator_id}
                    roomInfo={this.props.roomInfo}
                    endgame_amount={this.props.roomInfo.endgame_amount}
                    playSound={this.playSound}
                    is_private={this.props.roomInfo.is_private}
                    youtubeUrl={this.props.roomInfo.youtubeUrl}
                  />
                )}
                {this.props.roomInfo.game_type === 'Mystery Box' &&
                  this.props.roomInfo.box_list.length > 0 && (
                    <MysteryBox
                      refreshHistory={this.refreshHistory}
                      join={this.join}
                      box_list={this.props.roomInfo.box_list}
                      box_price={this.props.roomInfo.box_price}
                      user_id={this.props.user_id}
                      creator_id={this.props.roomInfo.creator_id}
                      is_private={this.props.roomInfo.is_private}
                      roomInfo={this.props.roomInfo}
                      playSound={this.playSound}
                      betResult={this.state.betResult}
                      youtubeUrl={this.props.roomInfo.youtubeUrl}
                    />
                  )}
                {this.props.roomInfo.game_type === 'Brain Game' && (
                  <BrainGame
                    refreshHistory={this.refreshHistory}
                    join={this.join}
                    brain_game_type={this.props.roomInfo.brain_game_type}
                    brain_game_score={this.props.roomInfo.brain_game_score}
                    bet_amount={this.props.roomInfo.bet_amount}
                    user_id={this.props.user_id}
                    creator_id={this.props.roomInfo.creator_id}
                    joined_count={
                      this.props.roomInfo.game_log_list
                        ? this.props.roomInfo.game_log_list.length
                        : 0
                    }
                    is_private={this.props.roomInfo.is_private}
                    roomInfo={this.props.roomInfo}
                    playSound={this.playSound}
                    youtubeUrl={this.props.roomInfo.youtubeUrl}
                  />
                )}
                {this.props.roomInfo.game_type === 'Quick Shoot' && (
                  <QuickShoot
                    refreshHistory={this.refreshHistory}
                    join={this.join}
                    user_id={this.props.user_id}
                    creator_id={this.props.roomInfo.creator_id}
                    qs_game_type={this.props.roomInfo.qs_game_type}
                    bet_amount={this.props.roomInfo.bet_amount}
                    bankroll={this.state.bankroll}
                    qs_bet_item_id={this.props.roomInfo.qs_bet_item_id}
                    is_private={this.props.roomInfo.is_private}
                    roomInfo={this.props.roomInfo}
                    playSound={this.playSound}
                    youtubeUrl={this.props.roomInfo.youtubeUrl}
                  />
                )}
                {this.props.roomInfo.game_type === 'Drop Game' && (
                  <DropGame
                    refreshHistory={this.refreshHistory}
                    join={this.join}
                    user_id={this.props.user_id}
                    creator_id={this.props.roomInfo.creator_id}
                    bet_amount={this.props.roomInfo.bet_amount}
                    bankroll={this.state.bankroll}
                    drop_bet_item_id={this.props.roomInfo.drop_bet_item_id}
                    is_private={this.props.roomInfo.is_private}
                    roomInfo={this.props.roomInfo}
                    playSound={this.playSound}
                    youtubeUrl={this.props.roomInfo.youtubeUrl}
                  />
                )}
                {this.props.roomInfo.game_type === 'Bang!' && (
                  <Bang
                    refreshHistory={this.refreshHistory}
                    join={this.join}
                    user_id={this.props.user_id}
                    creator_id={this.props.roomInfo.creator_id}
                    aveMultiplier={this.props.roomInfo.aveMultiplier}
                    bet_amount={this.props.roomInfo.bet_amount}
                    crashed={this.props.roomInfo.crashed}
                    cashoutAmount={this.props.roomInfo.cashoutAmount}
                    bankroll={this.state.bankroll}
                    bang_bet_item_id={this.props.roomInfo.bang_bet_item_id}
                    is_private={this.props.roomInfo.is_private}
                    roomInfo={this.props.roomInfo}
                    playSound={this.playSound}
                    playSoundLoop={this.playSoundLoop}
                    stopSound={this.stopSound}
                    youtubeUrl={this.props.roomInfo.youtubeUrl}
                  />
                )}
                {this.props.roomInfo.game_type === 'Roll' && (
                  <Roll
                    refreshHistory={this.refreshHistory}
                    join={this.join}
                    user_id={this.props.user_id}
                    creator_id={this.props.roomInfo.creator_id}
                    aveMultiplier={this.props.roomInfo.aveMultiplier}
                    bet_amount={this.props.roomInfo.bet_amount}
                    crashed={this.props.roomInfo.crashed}
                    cashoutAmount={this.props.roomInfo.cashoutAmount}
                    bankroll={this.state.bankroll}
                    roll_bet_item_id={this.state.roomInfo.roll_bet_item_id}
                    is_private={this.props.roomInfo.is_private}
                    roomInfo={this.props.roomInfo}
                    playSound={this.playSound}
                    stopSound={this.stopSound}
                    youtubeUrl={this.props.roomInfo.youtubeUrl}
                  />
                )}
{this.props.roomInfo.game_type === 'Blackjack' && (
                  <Blackjack
                    refreshHistory={this.refreshHistory}
                    playSound={this.playSound}
                    join={this.join}
                    roomInfo={this.props.roomInfo}
                    user_id={this.props.user_id}
                    creator_id={this.props.roomInfo.creator_id}
                    bet_amount={this.props.roomInfo.bet_amount}
                    bankroll={this.state.bankroll}
                    bj_bet_item_id={this.props.roomInfo.bj_bet_item_id}
                    is_private={this.props.roomInfo.is_private}
                    youtubeUrl={this.props.roomInfo.youtubeUrl}
                  />
                )}
                
              </div>
              <TabbedContent roomInfo={this.props.roomInfo}/>
              <div>
                {((!this.state.is_mobile &&
                  this.props.selectedMainTabIndex === 1) ||
                  (this.state.is_mobile &&
                    this.state.selectedMobileTab === 'my_games' &&
                    this.state.show_open_game === 0)) && (
                  <MyGamesTable gameTypeList={this.props.gameTypeList} />
                )}
                {this.state.is_mobile &&
                  this.state.selectedMobileTab === 'live_games' &&
                  this.state.show_open_game === 1 && <HistoryTable />}
                {this.state.is_mobile &&
                  this.state.selectedMobileTab === 'my_games' &&
                  this.state.show_open_game === 1 && <MyHistoryTable />}
              </div>
            </div>
            <div className="sub-panel">
              <h2 className="main-title desktop-only">HISTORY</h2>
              {!this.state.is_mobile &&
                this.props.selectedMainTabIndex === 0 && <HistoryTable />}
              <DrawerButton
                open={this.props.isDrawerOpen}
                toggleDrawer={this.toggleDrawer}
              />
              {!this.state.is_mobile &&
                this.props.selectedMainTabIndex === 1 && <MyHistoryTable />}
            </div>
            {!this.state.is_mobile && (
              <div className="mobile-only main-page-nav-button-group">
                <Button
                  className={`mobile-tab-live ${
                    this.state.selectedMobileTab === 'live_games'
                      ? 'active'
                      : ''
                  }`}
                  onClick={e => {
                    this.setState({ selectedMobileTab: 'live_games' });
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="none"
                    viewBox="0 0 32 32"
                  >
                    <path
                      stroke={
                        this.state.selectedMobileTab === 'live_games'
                          ? '#fff'
                          : '#8E9297'
                      }
                      strokeWidth="1.5"
                      d="M24.9 25.945c2.625-2.578 4.1-6.076 4.1-9.722 0-3.647-1.475-7.144-4.1-9.723M7.1 25.945C4.476 23.367 3 19.87 3 16.223 3 12.576 4.475 9.079 7.1 6.5M21 22.5c1.92-1.658 3-3.906 3-6.25s-1.08-4.592-3-6.25M14 17.678v-3.356c0-.79.871-1.268 1.537-.844l2.637 1.678c.618.393.618 1.295 0 1.688l-2.637 1.678c-.666.424-1.537-.055-1.537-.844zM11 22.5c-1.92-1.658-3-3.906-3-6.25s1.08-4.592 3-6.25"
                    />
                  </svg>
                  {this.state.selectedMobileTab === 'live_games' &&
                    'LIVE BATTLES'}
                </Button>
                <Button
                  className={`mobile-tab-my ${
                    this.state.selectedMobileTab === 'my_games' ? 'active' : ''
                  }`}
                  onClick={e => {
                    this.setState({ selectedMobileTab: 'my_games' });
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="33"
                    height="32"
                    fill="none"
                    viewBox="0 0 33 32"
                  >
                    <path
                      stroke={
                        this.state.selectedMobileTab === 'my_games'
                          ? '#fff'
                          : '#8E9297'
                      }
                      strokeWidth="1.5"
                      d="M27.5 27.5c0-2.917-1.159-5.715-3.222-7.778-2.063-2.063-4.86-3.222-7.778-3.222-2.917 0-5.715 1.159-7.778 3.222C6.659 21.785 5.5 24.582 5.5 27.5"
                    />
                    <path
                      fill={
                        this.state.selectedMobileTab === 'my_games'
                          ? '#fff'
                          : '#8E9297'
                      }
                      d="M18.651 12.702l-.674.33.674-.33zm-.294-.602l.674-.33c-.126-.257-.387-.42-.674-.42v.75zm-3.714 0v-.75c-.287 0-.548.163-.674.42l.674.33zm7.607-4.75v4.302h1.5V7.35h-1.5zm-2.925 5.022l-.294-.601-1.348.658.294.602 1.348-.659zm-.968-1.022h-3.714v1.5h3.714v-1.5zm-4.388.42l-.294.602 1.348.66.294-.603-1.348-.658zm-3.219-.118V7.35h-1.5v4.302h1.5zm2.036-6.402h7.428v-1.5h-7.428v1.5zm-.49 8c-.838 0-1.546-.7-1.546-1.598h-1.5c0 1.695 1.348 3.098 3.046 3.098v-1.5zm8.408 0c-.576 0-1.113-.333-1.379-.878l-1.348.66c.512 1.046 1.565 1.718 2.727 1.718v-1.5zm1.546-1.598c0 .899-.708 1.598-1.546 1.598v1.5c1.698 0 3.046-1.403 3.046-3.098h-1.5zm-8.575.72c-.266.545-.803.878-1.38.878v1.5c1.163 0 2.216-.672 2.728-1.719l-1.348-.659zM23.75 7.35c0-1.972-1.567-3.6-3.536-3.6v1.5c1.109 0 2.036.924 2.036 2.1h1.5zm-13 0c0-1.176.928-2.1 2.036-2.1v-1.5c-1.969 0-3.536 1.628-3.536 3.6h1.5zm1.571 1.7h2.786v-1.5h-2.786v1.5zm.643-2.175v2.85h1.5v-2.85h-1.5zM19.75 8.1h.929V6.6h-.929v1.5zM17.893 10h.928V8.5h-.928V10z"
                    />
                  </svg>
                  {this.state.selectedMobileTab === 'my_games' && 'MY BATTLES'}
                </Button>
                {/* <button
              className={`mobile-tab-leaderboards ${
                this.state.selectedMobileTab === 'leaderboards' ? 'active' : ''
              }`}
              onClick={e => {
                this.setState({ selectedMobileTab: 'leaderboards' });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="none"
                viewBox="0 0 32 32"
              >
                <path
                  stroke={
                    this.state.selectedMobileTab === 'leaderboards'
                      ? '#fff'
                      : '#8E9297'
                  }
                  strokeWidth="1.5"
                  d="M10.083 6.083h11.833v8.584c0 3.268-2.649 5.917-5.916 5.917-3.268 0-5.917-2.65-5.917-5.917V6.083zM9.333 26.666h13.333M22.223 14.597c3.528-.571 4.444-4.538 4.444-6.597H22M9.777 14.597C6.25 14.026 5.333 10.06 5.333 8H10M16 21.334v5.333"
                />
              </svg>
              {this.state.selectedMobileTab === 'leaderboards' &&
                'LEADERBOARDS'}
            </button> */}
                <Button
                  className={`mobile-tab-chat ${
                    this.state.selectedMobileTab === 'chat' ? 'active' : ''
                  }`}
                  onClick={e => {
                    this.setState({ selectedMobileTab: 'chat' });
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="33"
                    height="32"
                    fill="none"
                    viewBox="0 0 33 32"
                  >
                    <path
                      stroke={
                        this.state.selectedMobileTab === 'chat'
                          ? '#fff'
                          : '#8E9297'
                      }
                      strokeWidth="1.5"
                      d="M28 16c0 6.351-5.149 11.5-11.5 11.5-1.407 0-2.754-.253-4-.715-2.75-1.02-4.091 1.378-4.75.965-.685-.43 1.328-2.929.75-3.489C6.342 22.171 5 19.242 5 16 5 9.649 10.149 4.5 16.5 4.5S28 9.649 28 16z"
                    />
                    <circle
                      cx="10.5"
                      cy="16"
                      r="2"
                      stroke={
                        this.state.selectedMobileTab === 'chat'
                          ? '#fff'
                          : '#8E9297'
                      }
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="16.5"
                      cy="16"
                      r="2"
                      stroke={
                        this.state.selectedMobileTab === 'chat'
                          ? '#fff'
                          : '#8E9297'
                      }
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="22.5"
                      cy="16"
                      r="2"
                      stroke={
                        this.state.selectedMobileTab === 'chat'
                          ? '#fff'
                          : '#8E9297'
                      }
                      strokeWidth="1.5"
                    />
                  </svg>
                  {this.state.selectedMobileTab === 'chat' && 'CHAT'}
                </Button>
              </div>
            )}
            <Footer
              className="footer"
              open={this.props.isDrawerOpen}
              style={{ marginLeft: this.props.isDrawerOpen ? '270px' : '0' }}
            />
          </div>
        </LoadingOverlay>
      </>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth.isAuthenticated,
  history: state.logic.history,
  roomInfo: state.logic.curRoomInfo,
  user_id: state.auth.user._id,
  isMuted: state.auth.isMuted,
  selectedMainTabIndex: state.logic.selectedMainTabIndex,
  isDrawerOpen: state.auth.isDrawerOpen
});

const mapDispatchToProps = {
  getRoomInfo,
  bet,
  toggleMute,
  setCurRoomInfo,
  loadRoomInfo,
  getMyChat,
  getMyGames,
  getMyHistory,
  getHistory,
  toggleDrawer,
  getGameTypeList
};

export default connect(mapStateToProps, mapDispatchToProps)(JoinGame);
