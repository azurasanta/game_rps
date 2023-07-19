import React, { Component } from 'react';
import { connect } from 'react-redux';
import history from '../../redux/history';
import RPS from '../CreateGame/RPS';
import Spleesh from '../CreateGame/Spleesh';
import MysteryBox from '../CreateGame/MysteryBox';
import DropGame from '../CreateGame/DropGame';
import BrainGame from '../CreateGame/BrainGame';
import PlayBrainGame from '../CreateGame/PlayBrainGame';
import QuickShoot from '../CreateGame/QuickShoot';
import Bang from '../CreateGame/Bang';
import Blackjack from '../CreateGame/Blackjack';
import Roll from '../CreateGame/Roll';
import { Button } from '@material-ui/core';
import Footer from './Footer';
import { toggleDrawer } from '../../redux/Auth/user.actions';
import Summary from '../CreateGame/Summary';
import {
  createRoom,
  setGameMode,
  getMyGames,
  getMyHistory,
  getHistory,
  getMyChat,
  getGameTypeList
} from '../../redux/Logic/logic.actions';
import { getBrainGameType } from '../../redux/Question/question.action';
import { alertModal, confirmModalCreate } from '../modal/ConfirmAlerts';
import AdvancedSettings from '../CreateGame/AdvancedSettings';
import { convertToCurrency } from '../../util/conversion';
import MyGamesTable from '../MyGames/MyGamesTable';
import LoadingOverlay from 'react-loading-overlay';
// import BounceLoader from 'react-spinners/BounceLoader';

import MyHistoryTable from '../MyGames/MyHistoryTable';
import HistoryTable from '../LiveGames/HistoryTable';
import ChatPanel from '../ChatPanel/ChatPanel';
import { Tabs, Tab, Drawer } from '@material-ui/core';
import DrawerButton from './DrawerButton';

const customStyles = {
  tabRoot: {
    textTransform: 'none',
    width: '50%',
    // height: '48px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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

class CreateGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_mobile: window.innerWidth < 1024 ? true : false,
      selectedMobileTab: 'live_games',
      step: 2,
      child_step: 1,
      game_type: 1,
      game_mode: this.props.game_mode,
      isPlayingBrain: false,
      rps_list: [],
      drop_list: [],
      bang_list: [],
      bj_list: [],
      roll_list: [],
      qs_list: [],
      qs_game_type: 2,
      qs_nation: 0,
      selected_rps: '',
      selected_drop: '',
      selected_bang: '',
      selected_qs_position: 0,
      bet_amount: 10.00,
      endgame_amount: 0,
      spleesh_bet_unit: 1,
      max_return: 0,
      creatingRoom: false,
      max_prize: 0,
      winChance: 0,
      lowest_box_price: 0,
      public_bet_amount: convertToCurrency(0),
      is_private: false,
      is_anonymous: false,
      room_password: '',
      aveMultiplier: 0,
      score: 0,
      youtubeUrl: '',
      videoId: '',
      isPlaying: false,
      endgame_type: true,
      box_list: [],
      brain_game_type: this.props.brain_game_type,
      rps_game_type: 0,
      sounds: {
        wrong: new Audio('/sounds/wrong.mp3'),
        correct: new Audio('/sounds/correct.mp3'),
        boop: new Audio('/sounds/boop.mp3'),
        countDown: new Audio('/sounds/countDown.mp3'),
        grunt2: new Audio('/sounds/grunt2.mp3'),
        grunt: new Audio('/sounds/grunt.mp3'),
        select: new Audio('/sounds/select.mp3'),
        addTen: new Audio('/sounds/addTen.mp3'),
        tap: new Audio('/sounds/tap.mp3'),
        addBox: new Audio('/sounds/addBox.mp3'),
        cards: new Audio('/sounds/card.mp3'),

      }
    };
  }

  static getDerivedStateFromProps(props, current_state) {
    if (
      current_state.game_mode !== props.game_mode ||
      current_state.balance !== props.balance ||
      current_state.brain_game_type !== props.brain_game_type
    ) {
      return {
        ...current_state,
        game_mode: props.game_mode,
        brain_game_type: props.brain_game_type,
        balance: props.balance
      };
    }
    return null;
  }

  handleUrlChange = (event) => {
    this.setState({
      youtubeUrl: event.target.value,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { youtubeUrl } = this.state;
    const videoId = this.getVideoId(youtubeUrl);

    this.setState({
      videoId,
      isPlaying: true,
    });
  };
  
  getVideoId = (url) => {
    // Extract the video ID from the YouTube URL
    const videoId = url.split('v=')[1];
    const ampersandPosition = videoId.indexOf('&');
    if (ampersandPosition !== -1) {
      return videoId.substring(0, ampersandPosition);
    }
    return videoId;
  };

  onChangeState = async newState => {
    await this.setState(newState);
  };

  toggleDrawer = () => {
    this.props.toggleDrawer(!this.props.isDrawerOpen);
  };

  calculateEV(originalBet, maxSum, spleesh_bet_unit) {
    const sum = (55 * spleesh_bet_unit) - originalBet; // sum of all possible wrong guesses
    const n = originalBet; // number of possible guesses
    const p = 1 / n; // probability of guessing correctly
    let expectedValue = (originalBet * (sum - maxSum) * p) - ((sum - maxSum) * (1 - p));
  
    let scale = 1;
    if (maxSum < originalBet) {
      scale = (maxSum / originalBet) ** 2;
    } else if (maxSum > sum) {
      expectedValue *= -1;
      scale = -1;
    } else {
      scale = 1 - ((sum - maxSum) / (sum - originalBet));
      scale = 1 - scale ** 2; // adjust scale based on quadratic function
    }
  
    expectedValue *= scale;
    return expectedValue / p;
  }

  calcMysteryBoxEV(boxList, targetSum, max_return) {
    const totalBoxes = boxList.length;
    const probability = 1 / totalBoxes;
    let expectedValue = 0;
    const totalPrizes = boxList.reduce((acc, curr) => acc + curr.box_prize, 0);
    const targetDiff = Math.abs(targetSum - totalPrizes);
    const maxDiff = Math.abs(max_return - totalPrizes);
    
    for (let i = 0; i < totalBoxes; i++) {
      const boxPrice = boxList[i].box_price;
      const boxPrize = boxList[i].box_prize;
      const boxEV = (boxPrice - boxPrize) * (1 - probability) - (boxPrize * probability);
      expectedValue += boxEV;
    }
    
    let scale = 1;
    if (targetSum >= totalPrizes && targetSum <= max_return) {
      scale = 1 - (targetDiff / maxDiff);
    } else if (targetSum > max_return) {
      expectedValue *= -1;
    }
    
    expectedValue *= scale;
    return expectedValue;
  }  
    
  
  async componentDidMount() {
    Object.values(this.state.sounds).forEach(sound => {
      sound.load();
    });
    this.IsAuthenticatedReroute();
    this.props.getHistory();
    // this.props.getGameTypeList();
    const gameTypeName = this.props.match.params.game_type_name;

    if (this.props.isAuthenticated) {
      this.props.getMyGames();
      this.props.getMyHistory();
      this.props.getMyChat();
    }
    if (gameTypeName === 'Brain Game') {
      this.props.getBrainGameType();
    }
    this.props.getBrainGameType();
    await this.props.setGameMode(gameTypeName);

    let newState = {
      child_step: 1,
      bet_amount: 10.00,
      endgame_amount: 0,
      max_return: 0,
      max_prize: 0,
      lowest_box_price: 0,
      public_bet_amount: convertToCurrency(1)
    };

    if (gameTypeName === 'Spleesh!') {
      newState = {
        ...newState,
        game_type: 2,
        winChance: 0,
        endgame_amount: 54,
        max_return: 54,
        public_bet_amount: this.state
      };
    } else if (gameTypeName === 'RPS') {
      newState = {
        ...newState,
        game_type: 1,
        bet_amount: 10.00,
        winChance: 0,
        max_return: 0,
        endgame_amount: 0
      };
    } else if (gameTypeName === 'Brain Game') {
      newState = {
        ...newState,
        game_type: 3,
        winChance: 0,
        max_return: '∞',
        endgame_amount: 0
      };
    } else if (gameTypeName === 'Quick Shoot') {
      newState = {
        ...newState,
        game_type: 5,
        public_bet_amount: convertToCurrency(1),
        max_return: 2,
        bet_amount: 0.01,
        winChance: 0,
        qs_nation: Math.floor(Math.random() * 5),
        endgame_amount: 0
      };
    } else if (gameTypeName === 'Mystery Box') {
      newState = {
        ...newState,
        game_type: 4,
        winChance: 0,
        bet_amount: 0,
        public_bet_amount: 0,
        endgame_amount: 0
      };
    } else if (gameTypeName === 'Drop Game') {
      newState = {
        ...newState,
        game_type: 6,
        winChance: 0,
        bet_amount: 10.00,
        endgame_amount: 0
      };
    } else if (gameTypeName === 'Bang!') {
      newState = {
        ...newState,
        game_type: 7,
        winChance: 0,
        bet_amount: 10.00,
        endgame_amount: 0,
        aveMultiplier: 0,
      };
    } else if (gameTypeName === 'Roll') {
      newState = {
        ...newState,
        game_type: 8,
        winChance: 0,
        bet_amount: 10.00,
        endgame_amount: 0,
        aveMultiplier: 0,
      };
    } else if (gameTypeName === 'Blackjack') {
      newState = {
        ...newState,
        game_type: 9,
        bet_amount: 10.00,
        winChance: 0,
        max_return: 0,
        endgame_amount: 0
      };
    }

    this.setState(newState);
  }

  IsAuthenticatedReroute = () => {
    if (!this.props.auth) {
      history.push('/');
    }
  };

  onSkipButtonClicked = () => {
    this.setState({
      is_private: false,
      youtubeUrl: '',
      is_anonymous: false,
      endgame_type: false,
      step: this.state.step + 1
    });
  };

  onStartBrainGame = e => {
    e.preventDefault();
    if (localStorage.getItem('hideConfirmModal') === 'true') {
      this.setState({
        step: 5,
        isPlayingBrain: true
      });
    } else {
      confirmModalCreate(
        this.props.isDarkMode,
        'ARE YOU SURE YOU CANNOT BET MORE, BROKIE?',
        'Okay',
        'Cancel',
        () => {
          this.setState({
            step: 5,
            isPlayingBrain: true
          });
        }
      );
    }
  };
  
  onPrevButtonClicked = () => {
    if (this.state.game_mode !== 'Mystery Box' && this.state.step < 5) {
      if (this.state.step === 3 && this.state.child_step === 1) {
        if (this.state.game_mode === 'Quick Shoot') {
          this.setState({
            step: 2,
            child_step: 3
          });
        } else {
          this.setState({
            step: 2,
            child_step: 2
          });
        }
        return;
      } else if (this.state.child_step > 1) {
        this.setState({
          child_step: this.state.child_step - 1
        });

        return;
      }
    }

    this.setState({
      step: this.state.step > 1 ? this.state.step - 1 : this.state.step
    });
  };

  onNextButtonClicked = () => {
    if (this.state.step === 2) {
      if (
        (this.state.game_mode !== 'RPS' ||
          (this.state.game_mode === 'RPS' && this.state.child_step === 1)) &&
        (parseFloat(this.state.bet_amount) <= 0 ||
          isNaN(parseFloat(this.state.bet_amount)))
      ) {
        alertModal(this.props.isDarkMode, "YOU DIDN'T BET ANYTHING!!!");
        return;
      }

      if (
        this.state.game_mode === 'RPS' &&
        this.state.child_step === 2 &&
        this.state.rps_list.length < 3
      ) {
        alertModal(this.props.isDarkMode, 'MINIMUM 3 RUNS NEEDED');
        return;
      }

      if (this.state.bet_amount > this.state.balance) {
        alertModal(this.props.isDarkMode, 'MAKE A DEPOSIT, BROKIE!');
        return;
      }
      if (
        this.state.game_mode === 'Quick Shoot' &&
        this.state.child_step === 1 &&
        this.state.qs_list.length > 0
      ) {
        // If the game mode is Quick Shoot and the step is 3, clear the qslist
        this.setState({
          qs_list: [],
          winChance: 0,
          step: this.state.step > 1
        });
        return;
      }

      if (
        this.state.game_mode === 'Quick Shoot' &&
        this.state.child_step === 3 &&
        this.state.qs_list.length < 3
      ) {
        alertModal(this.props.isDarkMode, 'MINIMUM 3 RUNS NEEDED');
        return;
      } else if (
        this.state.game_mode === 'Drop Game' &&
        this.state.child_step === 2 &&
        this.state.drop_list.length < 3
      ) {
        alertModal(this.props.isDarkMode, 'MINIMUM 3 RUNS NEEDED');
        return;
      } else if (
        this.state.game_mode === 'Bang!' &&
        this.state.child_step === 2 &&
        this.state.bang_list.length < 3
      ) {
        alertModal(this.props.isDarkMode, 'MINIMUM 3 RUNS NEEDED');
        return;
      } else if (
        this.state.game_mode === 'Roll' &&
        this.state.child_step === 2 &&
        this.state.roll_list.length < 3
      ) {
        alertModal(this.props.isDarkMode, 'MINIMUM 3 RUNS NEEDED');
        return;
      }
      else if (
        this.state.game_mode === 'Blackjack' &&
        this.state.child_step === 2 &&
        this.state.bj_list.length < 3
      ) {
        alertModal(this.props.isDarkMode, 'MINIMUM 3 RUNS NEEDED');
        return;
      }

      if (this.state.game_mode === 'Quick Shoot' && this.state.child_step < 3) {
        this.setState({
          child_step: this.state.child_step + 1
        });
        return;
      } else if (
        this.state.game_mode !== 'Mystery Box' &&
        this.state.child_step === 1
      ) {
        this.setState({
          child_step: this.state.child_step + 1
        });
        return;
      } else {
        this.setState({
          step: 3,
          child_step: 1
        });
        return;
      }
    } else if (this.state.child_step === 2 && this.state.game_mode === 'Spleesh!') {
      if ((this.state.spleesh_bet_unit === 1 && this.state.endgame_amount < 36) || (this.state.spleesh_bet_unit === 10 && this.state.endgame_amount < 360)) {
        alertModal(
          this.props.isDarkMode,
          `TOO PROFITABLE! PAYOUT MUST BE MORE THAN ${35 * this.state.spleeshh_bet_unit}`
        );
        return;
      }
      this.setState({
        child_step: this.state.child_step + 1
      });
     } else if (this.state.child_step === 2 && this.state.game_mode === 'Mystery Box') {
      if (this.state.max_return > (this.state.bet_amount * 4)) {
        alertModal(
          this.props.isDarkMode,
          `TOO PROFITABLE! GAME IS UNFAIR`
        );
        return;
      } else if (this.state.endgame_amount < this.state.bet_amount) {
        alertModal(
          this.props.isDarkMode,
          `THIS GAME REQUIRES A PAYOUT MORE THAN BET AMOUNT`
        );
        return;
      }
      this.setState({
        child_step: this.state.child_step + 1
      });
     } else if (this.state.child_step === 2) {
      if (this.state.endgame_type && isNaN(this.state.endgame_amount)) {
        alertModal(
          this.props.isDarkMode,
          `ENTER A VALID NUMBER, WANKER!`
        );
        return;
      }
      this.setState({
        child_step: this.state.child_step + 1
      });
     } else if (this.state.child_step === 1) {
      if (this.state.is_private === true && this.state.room_password === '') {
        alertModal(
          this.props.isDarkMode,
          `SET THE PASSWORD TO JOIN YOUR GAME!`
        );
        return;
      }

      if (this.state.endgame_amount === 0) {
        this.setState({ endgame_type: false });
      }

    
        this.setState({
          child_step: this.state.child_step + 1
        });
        return;
    
    }

    this.setState({
      step: this.state.step < 5 ? this.state.step + 1 : this.state.step
    });
  };


  playSound = sound => {
    if (!this.props.isMuted) {
      const audio = this.state.sounds[sound];
      audio.currentTime = 0;
      audio.play();
    }
  };


  onCreateRoom = async () => {
    if (localStorage.getItem('hideConfirmModal') === 'true') {
      this.setState({ creatingRoom: true });
      await this.props.createRoom(this.state);
      this.setState({ creatingRoom: false });
    } else {
      confirmModalCreate(
        this.props.isDarkMode,
        'CONFIRM GAME SETTINGS?',
        'LFG',
        'Cancel',
        async () => {
          this.setState({ creatingRoom: true });
          await this.props.createRoom(this.state);
          this.setState({ creatingRoom: false });
        }
      );
    }
  };

  step2 = () => {
    if (this.state.game_mode === 'RPS') {
      return (
        <RPS
        playSound={this.playSound}

          onChangeState={this.onChangeState}
          rps_list={this.state.rps_list}
          bet_amount={this.state.bet_amount}
          winChance={this.state.winChance}
          is_private={this.state.is_private}
          is_anonymous={this.state.is_anonymous}
          room_password={this.state.room_password}
          step={this.state.child_step}
          endgame_amount={this.state.endgame_amount}
          rps_game_type={this.state.rps_game_type}
       youtubeUrl={this.state.youtubeUrl}
        />
      );
    } else if (this.state.game_mode === 'Spleesh!') {
      return (
        <Spleesh
        playSound={this.playSound}

        calculateEV={this.calculateEV}
          onChangeState={this.onChangeState}
          bet_amount={this.state.bet_amount}
          spleesh_bet_unit={this.state.spleesh_bet_unit}
          is_private={this.state.is_private}
          is_anonymous={this.state.is_anonymous}
          room_password={this.state.room_password}
          winChance={this.state.winChance}
          endgame_type={this.state.endgame_type}
          endgame_amount={this.state.endgame_amount}
          step={this.state.child_step}
          youtubeUrl={this.state.youtubeUrl}
        />
      );
    } else if (this.state.game_mode === 'Mystery Box') {
      return (
        <MysteryBox
        playSound={this.playSound}
        calcMysteryBoxEV={this.calcMysteryBoxEV}
          onChangeState={this.onChangeState}
          box_list={this.state.box_list}
          bet_amount={this.state.bet_amount}
          max_return={this.state.max_return}
          max_prize={this.state.max_prize}
          winChance={this.state.winChance}
          endgame_amount={this.state.endgame_amount}
          calcWinChance={this.calcWinChance}
        />
      );
    } else if (this.state.game_mode === 'Brain Game') {
      return (
        <BrainGame
        playSound={this.playSound}

          onChangeState={this.onChangeState}
          bet_amount={this.state.bet_amount}
          winChance={this.state.winChance}
          brain_game_type={this.state.brain_game_type}
          step={this.state.child_step}
          endgame_amount={this.state.endgame_amount}
        />
      );
    } else if (this.state.game_mode === 'Quick Shoot') {
      return (
        <QuickShoot
        playSound={this.playSound}

          onChangeState={this.onChangeState}
          qs_list={this.state.qs_list}
          bet_amount={this.state.bet_amount}
          is_private={this.state.is_private}
          is_anonymous={this.state.is_anonymous}
          winChance={this.state.winChance}
          room_password={this.state.room_password}
          endgame_amount={this.state.endgame_amount}
          qs_game_type={this.state.qs_game_type}
          selected_qs_position={this.state.selected_qs_position}
          step={this.state.child_step}
          qs_nation={this.state.qs_nation}
          youtubeUrl={this.state.youtubeUrl}
        />
      );
    } else if (this.state.game_mode === 'Drop Game') {
      return (
        <DropGame
        playSound={this.playSound}

          onChangeState={this.onChangeState}
          drop_list={this.state.drop_list}
          bet_amount={this.state.bet_amount}
          winChance={this.state.winChance}
          is_private={this.state.is_private}
          is_anonymous={this.state.is_anonymous}
          room_password={this.state.room_password}
          step={this.state.child_step}
          endgame_amount={this.state.endgame_amount}
          youtubeUrl={this.state.youtubeUrl}
        />
      );
    } else if (this.state.game_mode === 'Bang!') {
      return (
        <Bang
        playSound={this.playSound}

          onChangeState={this.onChangeState}
          bang_list={this.state.bang_list}
          bet_amount={this.state.bet_amount}
          winChance={this.state.winChance}
          aveMultiplier={this.state.aveMultiplier}
          is_private={this.state.is_private}
          is_anonymous={this.state.is_anonymous}
          room_password={this.state.room_password}
          step={this.state.child_step}
          endgame_amount={this.state.endgame_amount}
          youtubeUrl={this.state.youtubeUrl}
        />
      );
    } else if (this.state.game_mode === 'Roll') {
      return (
        <Roll
        playSound={this.playSound}

          onChangeState={this.onChangeState}
          roll_list={this.state.roll_list}
          bet_amount={this.state.bet_amount}
          winChance={this.state.winChance}
          aveMultiplier={this.state.aveMultiplier}
          is_private={this.state.is_private}
          is_anonymous={this.state.is_anonymous}
          room_password={this.state.room_password}
          step={this.state.child_step}
          endgame_amount={this.state.endgame_amount}
          youtubeUrl={this.state.youtubeUrl}
        />
      );
    } else if (this.state.game_mode === 'Blackjack') {
      return (
        <Blackjack
        playSound={this.playSound}
          onChangeState={this.onChangeState}
          bj_list={this.state.bj_list}
          bet_amount={this.state.bet_amount}
          winChance={this.state.winChance}
          is_private={this.state.is_private}
          is_anonymous={this.state.is_anonymous}
          room_password={this.state.room_password}
          step={this.state.child_step}
          endgame_amount={this.state.endgame_amount}
          child_step={this.state.child_step}
          youtubeUrl={this.state.youtubeUrl}
       
        />
      );
    } 
    return <></>;
  };

  action_panel = () => {
    return (
      <>
        <hr />
        <div className="action-panel">
          {(this.state.step < 3 && this.state.step > 6) &&
          this.state.child_step === 1 ? (
            <span></span>
          ) : (
            <Button id="btn_prev" onClick={this.onPrevButtonClicked}>
              Previous
            </Button>
          )}
          {(this.state.step === 3 || this.state.step === 4) && (
            <Button id="btn_skip" onClick={this.onSkipButtonClicked}>
              Skip
            </Button>
          )}
          {this.state.step === 5 && this.state.game_mode === 'Brain Game' && (
            <Button id="btn_bet" onClick={this.onStartBrainGame}>
              Start
            </Button>
          )}
          {this.state.step === 5 && this.state.game_mode !== 'Brain Game' && (
            <Button id="btn_bet" onClick={this.onCreateRoom}>
              Place Bet
            </Button>
          )}
          {this.state.step < 5 && this.state.step !== 1 && (
            <Button id="btn_next" onClick={this.onNextButtonClicked}>
              Next
            </Button>
          )}
        </div>
      </>
    );
  };

  getActiveTabText = () =>
    (this.state.is_mobile && this.state.selectedMobileTab === 'live_games') ||
    (!this.state.is_mobile && this.props.selectedMainTabIndex === 0) ? (
      <div id="liveStakes">{this.props.roomCount} LIVE BATTLES</div>
    ) : (
      'My Battles'
    );

  render() {
    const { isDrawerOpen } = this.props;
    return (
      <LoadingOverlay
      className="custom-loading-overlay"
      active={this.state.creatingRoom}
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
              marginBottom: '10px',
            }}
          />
          <div>Summoning AI...</div>
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
          {((this.state.is_mobile && this.state.selectedMobileTab === 'chat') ||
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
            <h2 className="main-title desktop-only">
              {this.getActiveTabText()}
            </h2>
            <div className="create-game-panel">
              <div className="game-page">
                <div className="page-title">
                  <h2>CREATE {this.state.game_mode} AI</h2>
                  {this.state.step === 6 &&
                  this.state.game_mode === 'Brain Game' &&
                  this.state.isPlayingBrain ? (
                    <Summary
                      bet_amount={this.state.bet_amount}
                      max_return={this.state.max_return}
                      endgame_type={this.state.endgame_type}
                      endgame_amount={this.state.endgame_amount}
                      is_private={this.state.is_private}
                      step={this.state.step}
                      aveMultiplier={this.state.aveMultiplier}
                      child_step={this.state.child_step}
                      game_mode={this.state.game_mode}
                      max_prize={this.state.max_prize}
                      winChance={this.state.winChance}
                      public_bet_amount={this.state.public_bet_amount}
                      youtubeUrl={this.state.youtubeUrl}
                    />
                  ) : (
                    <span>Click the manual icon at the top for help.</span>
                  )}
                </div>
                <div className="game-contents">
                  {(this.state.step !== 5 ||
                    this.state.game_mode !== 'Brain Game' ||
                    !this.state.isPlayingBrain) && (
                    <Summary
                      bet_amount={this.state.bet_amount}
                      max_return={this.state.max_return}
                      endgame_type={this.state.endgame_type}
                      endgame_amount={this.state.endgame_amount}
                      is_private={this.state.is_private}
                      step={this.state.step}
                      aveMultiplier={this.state.aveMultiplier}
                      calcAveMultiplier={this.props.calcAveMultiplier}
                      child_step={this.state.child_step}
                      game_mode={this.state.game_mode}
                      max_prize={this.state.max_prize}
                      public_bet_amount={this.state.public_bet_amount}
                      spleesh_bet_unit={this.state.spleesh_bet_unit}
                      winChance={this.state.winChance}
                      calcWinChance={this.props.calcWinChance}
                      youtubeUrl={this.state.youtubeUrl}
                    />
                  )}
                  {this.state.step === 2 && this.step2()}
                  {(this.state.step === 3 || this.state.step === 4) && (
                    <AdvancedSettings
                    calculateEV={this.calculateEV}
                    max_return={this.state.max_return}
                    calcMysteryBoxEV={this.calcMysteryBoxEV}
                      spleesh_bet_unit={this.state.spleesh_bet_unit}
                      onChangeState={this.onChangeState}
                      winChance={this.state.winChance}
                      bet_amount={this.state.bet_amount}
                      is_private={this.state.is_private}
                      room_password={this.state.room_password}
                      game_mode={this.state.game_mode}
                      endgame_type={this.state.endgame_type}
                      endgame_amount={this.state.endgame_amount}
                      is_anonymous={this.state.is_anonymous}
                      step={this.state.child_step}
                      box_list={this.state.box_list}
                      youtubeUrl={this.state.youtubeUrl}
                      videoId={this.state.videoId}
                      isPlaying={this.state.isPlaying}
                      handleSubmit={this.handleSubmit}
                      handleUrlChange={this.handleUrlChange}
                    />
                  )}
                  {this.state.step === 5 &&
                    this.state.game_mode === 'Brain Game' &&
                    this.state.isPlayingBrain && (
                      <PlayBrainGame
                      playSound={this.playSound}
                        brain_game_type={this.state.brain_game_type}
                        bet_amount={this.state.bet_amount}
                        is_private={this.state.is_private}
                        is_anonymous={this.state.is_anonymous}
                        room_password={this.state.room_password}
                        endgame_amount={this.state.endgame_amount}
                        youtubeUrl={this.state.youtubeUrl}
                      />
                    )}
                  {this.state.step !== 6 && this.action_panel()}
                </div>
              </div>
            </div>
          </div>
          <div className="sub-panel">
            <h2 className="main-title desktop-only">HISTORY</h2>
            {!this.state.is_mobile && this.props.selectedMainTabIndex === 0 && (
              <HistoryTable />
            )}
            {!this.state.is_mobile && this.props.selectedMainTabIndex === 1 && (
              <MyHistoryTable />
            )}
            <DrawerButton
              open={this.props.isDrawerOpen}
              toggleDrawer={this.toggleDrawer}
            />
          </div>
          {!this.state.is_mobile && (
            <div className="mobile-only main-page-nav-button-group">
              <Button
                className={`mobile-tab-live ${
                  this.state.selectedMobileTab === 'live_games' ? 'active' : ''
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
                {this.state.selectedMobileTab === 'live_games' && 'LIVE BATTLES'}
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
                      <Footer className="footer" open={this.props.isDrawerOpen} style={{ marginLeft: this.props.isDrawerOpen ? '270px' : '0' }} />

        </div>
      </LoadingOverlay>
    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  history: state.logic.history,
  pageNumber: state.logic.pageNumber,
  totalPage: state.logic.totalPage,
  balance: state.auth.balance,
  user: state.auth.user,
  gameTypeList: state.logic.gameTypeList,
  selectedMainTabIndex: state.logic.selectedMainTabIndex,

  auth: state.auth.isAuthenticated,
  landingItemList: state.landingReducer.landingItemList,
  game_mode: state.logic.game_mode,
  socket: state.auth.socket,
  balance: state.auth.balance,
  brain_game_type: state.questionReducer.brain_game_type,
  isDarkMode: state.auth.isDarkMode,
  isDrawerOpen: state.auth.isDrawerOpen
});

const mapDispatchToProps = {
  createRoom,
  setGameMode,
  getBrainGameType,
  getHistory,
  getMyGames,
  getMyHistory,
  getGameTypeList,
  getMyChat,
  toggleDrawer
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateGame);
