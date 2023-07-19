import React, { Component } from 'react';
import { connect } from 'react-redux';
import { openGamePasswordModal } from '../../redux/Notification/notification.actions';
import BetArray from '../../components/BetArray';
import Share from '../../components/Share';
import { IconButton, Button, TextField } from '@material-ui/core';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import { YouTubeVideo } from '../../components/YoutubeVideo';
import BetAmountInput from '../../components/BetAmountInput';
import {
  validateIsAuthenticated,
  validateCreatorId,
  validateBetAmount,
  validateLocalStorageLength,
  validateBankroll
} from '../modal/betValidations';

import Lottie from 'react-lottie';
import goalBg from '../LottieAnimations/goal-bg.json';

import animationData from '../LottieAnimations/spinningIcon';
import {
  alertModal,
  confirmModalCreate,
  gameResultModal
} from '../modal/ConfirmAlerts';
import history from '../../redux/history';
import { convertToCurrency } from '../../util/conversion';

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};
class QuickShoot extends Component {
  constructor(props) {
    super(props);
    this.settingsRef = React.createRef();

    this.socket = this.props.socket;
    this.state = {
      items: [],
      betting: false,
      timer: null,
      timerValue: 2000,
      intervalId: null,
      selected_qs_position: 0,
      advanced_status: '',
      is_anonymous: false,
      bet_amount: 1.00,
      bgColorChanged: false,
      potential_return: 1.25,
      bankroll: parseFloat(this.props.bet_amount) - this.getPreviousBets(),
      balance: this.props.balance,
      betResults: props.betResults,
      settings_panel_opened: false,
      isPasswordCorrect: this.props.isPasswordCorrect
    };
    this.handlePositionSelection = this.handlePositionSelection.bind(this);
    this.onChangeState = this.onChangeState.bind(this);
    this.panelRef = React.createRef();
  }
  componentDidMount() {
    const { socket } = this.props;
    socket.on('UPDATED_BANKROLL_QS', data => {
      this.setState({ bankroll: data.bankroll });
    });
  
    document.addEventListener('mousedown', this.handleClickOutside);
  }
  
  componentWillUnmount() {
    clearInterval(this.state.intervalId);
    document.removeEventListener('mousedown', this.handleClickOutside);
  }
  
  static getDerivedStateFromProps(props, current_state) {
    const { isPasswordCorrect, balance } = props;
  
    if (
      current_state.isPasswordCorrect !== isPasswordCorrect ||
      current_state.balance !== balance
    ) {
      return {
        ...current_state,
        balance,
        isPasswordCorrect
      };
    }
  
    return null;
  }
  
  getPreviousBets() {
    let previousBets = 0;
    const { roomInfo } = this.props;
  
    if (roomInfo && roomInfo.game_log_list) {
      roomInfo.game_log_list.forEach(room_history => {
        if (room_history.bet_amount) {
          previousBets += parseFloat(room_history.bet_amount);
        }
      });
    }
  
    return previousBets;
  }
  
  handlePositionSelection = position => {
    this.setState({ selected_qs_position: position });
    this.onBtnBetClick();
  };
  
  handleClickOutside = e => {
    const { settingsRef } = this;
    if (settingsRef && !settingsRef.current.contains(e.target)) {
      this.setState({ settings_panel_opened: false });
    }
  };
  
  componentDidUpdate(prevProps, prevState) {
    const { roomInfo } = this.props;
    const { isPasswordCorrect } = this.state;
  
    if (prevProps.roomInfo && roomInfo) {
      if (prevProps.roomInfo.bet_amount !== roomInfo.bet_amount) {
        this.setState({
          bankroll: parseFloat(roomInfo.bet_amount) - this.getPreviousBets()
        });
      }
    }
  
    if (
      prevState.isPasswordCorrect !== isPasswordCorrect &&
      isPasswordCorrect === true
    ) {
      this.joinGame();
    }
  }
  
  joinGame = async () => {
    const {
      qs_bet_item_id,
      isDarkMode,
      qs_game_type,
      refreshHistory,
      playSound
    } = this.props;
    const { bet_amount, selected_qs_position, is_anonymous } = this.state;

    const result = await this.props.join({
      bet_amount: parseFloat(bet_amount),

      selected_qs_position: selected_qs_position,
      is_anonymous: is_anonymous,
      qs_bet_item_id: qs_bet_item_id
    });

    if (result.status === 'success') {
      let text = 'LOST, KEEPER SAVED IT!';
      this.changeBgColor(result.betResult);
      playSound('lose');
      if (result.betResult === 1) {
        this.changeBgColor(result.betResult);
        playSound('win');
        text = 'WIN, EXCELLENT SHOT!';
      } else if (result.betResult === 0) {
        this.changeBgColor(result.betResult);
        playSound('split');
        text = 'Draw, No Winner!';
      }

      if (result.roomStatus === 'finished') {
        gameResultModal(
          isDarkMode,
          text,
          result.betResult,
          'Okay',
          null,
          () => {
            history.push('/');
          },
          () => {}
        );
      } else {
        gameResultModal(
          isDarkMode,
          text,
          result.betResult,
          'Okay',
          null,
          () => {
            // history.go(0);
          },
          () => {
            // history.push('/');
          }
        );
      }
    } else {
      if (result.message) {
        alertModal(isDarkMode, result.message);
      }
    }

    let stored_qs_array;

    if (qs_game_type === 2) {
      stored_qs_array = JSON.parse(localStorage.getItem('qs_array_2')) || [];
    } else if (qs_game_type === 3) {
      stored_qs_array = JSON.parse(localStorage.getItem('qs_array_3')) || [];
    } else if (qs_game_type === 4) {
      stored_qs_array = JSON.parse(localStorage.getItem('qs_array_4')) || [];
    } else if (qs_game_type === 5) {
      stored_qs_array = JSON.parse(localStorage.getItem('qs_array_5')) || [];
    }

    while (stored_qs_array.length >= 20) {
      stored_qs_array.shift();
    }

    stored_qs_array.push({ qs: selected_qs_position, room_id: qs_bet_item_id });

    if (qs_game_type === 2) {
      localStorage.setItem('qs_array_2', JSON.stringify(stored_qs_array));
    } else if (qs_game_type === 3) {
      localStorage.setItem('qs_array_3', JSON.stringify(stored_qs_array));
    } else if (qs_game_type === 4) {
      localStorage.setItem('qs_array_4', JSON.stringify(stored_qs_array));
    } else if (qs_game_type === 5) {
      localStorage.setItem('qs_array_5', JSON.stringify(stored_qs_array));
    }

    refreshHistory();
  };

  changeBgColor = async result => {
    this.setState({ betResult: result, bgColorChanged: true });
    await new Promise(resolve => setTimeout(resolve, 2500)); // Wait for 1 second
    this.setState({ bgColorChanged: false });
  };

  handleHalfXButtonClick = () => {
    const multipliedBetAmount = this.state.bet_amount * 0.5;
    const roundedBetAmount = (Math.floor(multipliedBetAmount * 100) / 100).toFixed(2);
    this.setState(
      {
        bet_amount: roundedBetAmount
      },
      () => {
        document.getElementById('betamount').focus();
      }
    );
  }

  handle2xButtonClick = () => {
    const multipliedBetAmount = this.state.bet_amount * 2;
    const limitedBetAmount = Math.min(multipliedBetAmount, this.state.balance);
    const roundedBetAmount = Math.floor(limitedBetAmount * 100) / 100;
   if (
      (this.state.bet_amount * 2) / (this.props.qs_game_type - 1) >
      this.state.bankroll
    ) {
      alertModal(this.props.isDarkMode, 'EXCEEDED BANKROLL');
    } else {
      this.setState(
        {
          bet_amount: roundedBetAmount
        },
        () => {
          document.getElementById('betamount').focus();
        }
      );
    }
  };

   handleMaxButtonClick = () => {
    const maxBetAmount = Math.floor(this.state.balance * 100) / 100;

    this.setState(
      {
        bet_amount: Math.min(
          maxBetAmount,
          this.state.bankroll * (this.props.qs_game_type - 1)
        )
      },
      () => {
        document.getElementById('betamount').focus();
      }
    );
  }


  calcWinChance = (gametype, rounds) => {
    let positionCounts = new Array(gametype + 1).fill(0);
    for (let i = 0; i < rounds.length; i++) {
      positionCounts[rounds[i].qs]++;
    }
    let entropy = 0;
    for (let i = 0; i < gametype; i++) {
      if (positionCounts[i] === 0) {
        continue;
      }
      let probability = positionCounts[i] / rounds.length;
      entropy -= probability * Math.log2(probability);
    }
    let winChanceMin = Math.max(
      0,
      (1 - entropy / Math.log2(gametype)) / gametype
    );
    let winChanceMax = Math.min(1, 1 - entropy / Math.log2(gametype));
    winChanceMin *= 100;
    winChanceMax *= 100;
    return winChanceMin.toFixed(2) + '% - ' + winChanceMax.toFixed(2) + '%';
  };

 
  updatePotentialReturn = () => {
    this.setState({
      potential_return:
        this.state.bet_amount / (this.props.qs_game_type - 1) +
        parseFloat(this.state.bet_amount) /* 0.95 */
    });
  };

  onChangeState(e) {
    this.setState({ bet_amount: e.target.value }, this.updatePotentialReturn);
  }

  calcWinChance = (gametype, rounds) => {
    let positionCounts = new Array(gametype + 1).fill(0);
    for (let i = 0; i < rounds.length; i++) {
      positionCounts[rounds[i].qs]++;
    }
    let entropy = 0;
    for (let i = 0; i < gametype; i++) {
      if (positionCounts[i] === 0) {
        continue;
      }
      let probability = positionCounts[i] / rounds.length;
      entropy -= probability * Math.log2(probability);
    }
    let winChanceMin = Math.max(
      0,
      (1 - entropy / Math.log2(gametype)) / gametype
    );
    let winChanceMax = Math.min(1, 1 - entropy / Math.log2(gametype));
    winChanceMin *= 100;
    winChanceMax *= 100;
    return winChanceMin.toFixed(2) + '% - ' + winChanceMax.toFixed(2) + '%';
  };

  predictNext = (qs_list, gameType) => {
    const options = [...Array(gameType).keys()];
    const transitionMatrix = {};
    options.forEach(option1 => {
      transitionMatrix[option1] = {};
      options.forEach(option2 => {
        transitionMatrix[option1][option2] = {};
        options.forEach(option3 => {
          transitionMatrix[option1][option2][option3] = {};
          options.forEach(option4 => {
            transitionMatrix[option1][option2][option3][option4] = 0;
          });
        });
      });
    });

    for (let i = 0; i < qs_list.length - 3; i++) {
      transitionMatrix[qs_list[i].qs][qs_list[i + 1].qs][qs_list[i + 2].qs][
        qs_list[i + 3].qs
      ]++;
    }

    Object.keys(transitionMatrix).forEach(fromState1 => {
      Object.keys(transitionMatrix[fromState1]).forEach(fromState2 => {
        Object.keys(transitionMatrix[fromState1][fromState2]).forEach(
          fromState3 => {
            const totalTransitions = Object.values(
              transitionMatrix[fromState1][fromState2][fromState3]
            ).reduce((a, b) => a + b);
            Object.keys(
              transitionMatrix[fromState1][fromState2][fromState3]
            ).forEach(toState => {
              transitionMatrix[fromState1][fromState2][fromState3][
                toState
              ] /= totalTransitions;
            });
          }
        );
      });
    });

    const winChance = this.calcWinChance(this.props.qs_game_type, qs_list);
    let deviation = 0;
    if (winChance !== '33.33%') {
      deviation = (1 - 1 / gameType) / 2;
    }

    let currentState1 = qs_list[qs_list.length - 3].qs;
    let currentState2 = qs_list[qs_list.length - 2].qs;
    let currentState3 = qs_list[qs_list.length - 1].qs;
    let nextState = currentState3;
    let maxProb = 0;
    Object.keys(
      transitionMatrix[currentState1][currentState2][currentState3]
    ).forEach(state => {
      if (
        transitionMatrix[currentState1][currentState2][currentState3][state] >
        maxProb
      ) {
        maxProb =
          transitionMatrix[currentState1][currentState2][currentState3][state];
        nextState = state;
      }
    });

    let randomNum = Math.random();
    if (randomNum < deviation) {
      let randomState = '';
      do {
        randomNum = Math.random();
        randomState = options[Math.floor(randomNum * gameType)];
      } while (randomState === nextState);
      nextState = randomState;
    }

    return nextState;
  };
  onBtnBetClick = () => {
    const {
      isAuthenticated,
      isDarkMode,
      creator_id,
      user_id,
      balance,
      qs_game_type,
      is_private,
      roomInfo,
      openGamePasswordModal
    } = this.props;
    const { bet_amount, bankroll } = this.state;
  
    if (!validateIsAuthenticated(isAuthenticated, isDarkMode)) {
      return;
    }
  
    if (!validateCreatorId(creator_id, user_id, isDarkMode)) {
      return;
    }
  
    if (!validateBetAmount(bet_amount, balance, isDarkMode)) {
      return;
    }
  
    if (!validateBankroll(bet_amount / (qs_game_type - 1) + parseFloat(bet_amount) - bankroll * (qs_game_type - 1), bankroll, isDarkMode)) {
      return;
    }
  
    const rooms = JSON.parse(localStorage.getItem('rooms')) || {};
    const passwordCorrect = rooms[roomInfo._id];
  
    if (localStorage.getItem('hideConfirmModal') === 'true') {
      if (is_private === true && passwordCorrect !== true) {
        openGamePasswordModal();
      } else {
        this.joinGame();
      }
    } else {
      confirmModalCreate(
        isDarkMode,
        'ARE YOU SURE YOU WANT TO PLACE THIS BET?',
        'Yes',
        'Cancel',
        async () => {
          if (is_private === true && passwordCorrect !== true) {
            openGamePasswordModal();
          } else {
            await this.joinGame();
          }
        }
      );
    }
  };
  
  handleButtonClick = () => {
    const {
      isAuthenticated,
      isDarkMode,
      creator_id,
      user_id,
      balance,
      qs_game_type
    } = this.props;
    const { bet_amount, bankroll, betting, timer } = this.state;
  
    if (!validateIsAuthenticated(isAuthenticated, isDarkMode)) {
      return;
    }
  
    if (!validateCreatorId(creator_id, user_id, isDarkMode)) {
      return;
    }
  
    if (!validateBetAmount(bet_amount, balance, isDarkMode)) {
      return;
    }
  
    if (!validateBankroll(bet_amount / (qs_game_type - 1) + parseFloat(bet_amount) - bankroll * (qs_game_type - 1), bankroll, isDarkMode)) {
      return;
    }
  
    if (!betting) {
      const newTimer = setInterval(() => {
        this.setState(state => {
          if (state.timerValue === 0) {
            clearInterval(timer);
            this.startBetting();
            return { timerValue: 2000 };
          } else {
            return { timerValue: state.timerValue - 10 };
          }
        });
      }, 10);
  
      this.setState({ timer: newTimer });
    } else {
      this.stopBetting();
    }
  };
  
  handleButtonRelease = () => {
    const { timer } = this.state;
  
    if (timer) {
      clearInterval(timer);
      this.setState({ timerValue: 2000 });
    }
  };
  
  startBetting = () => {
    let stored_qs_array;
    const { isDarkMode, qs_game_type, roomInfo, is_private, openGamePasswordModal, playSound } = this.props;
  
    switch (qs_game_type) {
      case 2:
        stored_qs_array = JSON.parse(localStorage.getItem('qs_array_2')) || [];
        break;
      case 3:
        stored_qs_array = JSON.parse(localStorage.getItem('qs_array_3')) || [];
        break;
      case 4:
        stored_qs_array = JSON.parse(localStorage.getItem('qs_array_4')) || [];
        break;
      case 5:
        stored_qs_array = JSON.parse(localStorage.getItem('qs_array_5')) || [];
        break;
      default:
        return;
    }
  
    if (!validateLocalStorageLength(`qs_array_${qs_game_type}`, isDarkMode)) {
      return;
    }
  
    const intervalId = setInterval(() => {
      const randomItem = this.predictNext(stored_qs_array, qs_game_type);
      const rooms = JSON.parse(localStorage.getItem('rooms')) || {};
      const passwordCorrect = rooms[roomInfo._id];
  
      if (is_private === true && passwordCorrect !== true) {
        openGamePasswordModal();
      } else {
        this.joinGame2(randomItem);
      }
    }, 3500);
  
    playSound('start');
    this.setState({ intervalId, betting: true });
  };
  
  stopBetting = () => {
    const { intervalId } = this.state;
    this.props.playSound('stop');
    clearInterval(intervalId);
    this.setState({ intervalId: null, betting: false, timerValue: 2000 });
  };
  
  joinGame2 = async randomItem => {
    const {
      isDarkMode,
      qs_game_type,
      qs_bet_item_id,
      refreshHistory,
      playSound
    } = this.props;
    const {
      bet_amount,
      bankroll,
      is_anonymous,
      selected_qs_position,
      slippage,
      betting
    } = this.state;
    this.setState({ selected_qs_position: randomItem });

    if (!betting) {
      return;
    }

    if (
      !validateBankroll(
        bet_amount / (qs_game_type - 1) +
          parseFloat(bet_amount) -
          bankroll * (qs_game_type - 1),
        bankroll,
        isDarkMode
      )
    ) {
      return;
    }

    const result = await this.props.join({
      bet_amount: parseFloat(bet_amount),
      selected_qs_position: selected_qs_position,
      is_anonymous: is_anonymous,
      qs_bet_item_id: qs_bet_item_id,
      slippage: slippage
    });

    const currentUser = this.props.user;
    const currentRoom = this.props.room;
    if (result.status === 'success') {
      this.setState(prevState => ({
        betResults: [
          ...prevState.betResults,
          { ...result, user: currentUser, room: currentRoom }
        ]
      }));
      let text = 'LOST, KEEPER SAVED IT!';

      if (result.betResult === 1) {
        this.changeBgColor(result.betResult);
        playSound('win');
        text = 'WIN, EXCELLENT SHOT!';
      } else if (result.betResult === 0) {
        this.changeBgColor(result.betResult);
        playSound('split');
        text = 'DRAW, NO WINNER!';
      } else {
        this.changeBgColor(result.betResult);
        playSound('lose');
      }

      refreshHistory();
    }
  };

  renderButton(id, position) {
    const { selected_qs_position, bgColorChanged, betResult } = this.state;

    const classes = `${selected_qs_position === position ? 'active' : ''}${
      bgColorChanged && betResult === -1 && selected_qs_position === position
        ? ' lose-bg'
        : ''
    }${betResult === 0 && selected_qs_position === position ? ' draw-bg' : ''}${
      betResult === 1 && selected_qs_position === position ? ' win-bg' : ''
    }`;

    return (
      <IconButton
        id={id}
        onClick={() => {
          this.handlePositionSelection(position);
          this.props.playSound('select');
        }}
        className={classes}
      />
    );
  }

  renderButtons() {
    const { qs_game_type } = this.props;

    if (qs_game_type === 2) {
      return (
        <div className="qs-buttons">
          {this.renderButton('l', 0)}
          {this.renderButton('r', 1)}
        </div>
      );
    } else if (qs_game_type === 3) {
      return (
        <div className="qs-buttons">
          {this.renderButton('l', 0)}
          {this.renderButton('cc', 1)}
          {this.renderButton('r', 2)}
        </div>
      );
    } else if (qs_game_type === 4) {
      return (
        <div className="qs-buttons">
          {this.renderButton('tl', 0)}
          {this.renderButton('tr', 1)}
          {this.renderButton('bl', 2)}
          {this.renderButton('br', 3)}
        </div>
      );
    } else if (qs_game_type === 5) {
      return (
        <div className="qs-buttons">
          {this.renderButton('tl', 1)}
          {this.renderButton('tr', 2)}
          {this.renderButton('bl', 3)}
          {this.renderButton('br', 4)}
          {this.renderButton('c', 0)}
        </div>
      );
    }
  }

  render() {
    const { qs_game_type } = this.props;

    let position_name = [
      'Center',
      'Top-Left',
      'Top-Right',
      'Bottom-Left',
      'Bottom-Right'
    ];
    let position_short_name = ['c', 'tl', 'tr', 'bl', 'br'];
    let arrayName;
    if (qs_game_type === 2) {
      position_name = ['Left', 'Right'];
      position_short_name = ['bl', 'br'];
      arrayName = 'qs_array_2';
    } else if (qs_game_type === 3) {
      position_name = ['Bottom-Left', 'Center', 'Bottom-Right'];
      position_short_name = ['bl', 'c', 'br'];
      arrayName = 'qs_array_3';
    } else if (qs_game_type === 4) {
      position_name = ['Top-Left', 'Top-Right', 'Bottom-Left', 'Bottom-Right'];
      position_short_name = ['tl', 'tr', 'bl', 'br'];
      arrayName = 'qs_array_4';
    } else if (qs_game_type === 5) {
      arrayName = 'qs_array_5';
    }

    return (
      <div className="game-page">
        <div className="page-title">
          <h2>PLAY - Quick Shoot</h2>
        </div>
        <div className="game-contents">
          <div
            className="pre-summary-panel"
            ref={this.panelRef}
            // onScroll={this.handleScroll}
          >
            <div className="pre-summary-panel__inner">
              {[...Array(1)].map((_, i) => (
                <React.Fragment key={i}>
                  <div className="data-item">
                    <div>
                      <div className="label room-id">STATUS</div>
                    </div>
                    <div className="value">{this.props.roomInfo.status}</div>
                  </div>
                 
                  <div className="data-item">
                    <div>
                      <div className="label your-bet-amount">Bankroll</div>
                    </div>
                    <div className="value">
                      {convertToCurrency(this.state.bankroll)}
                    </div>
                  </div>

                  <div className="data-item">
                    <div>
                      <div className="label your-max-return">Your Return</div>
                    </div>
                    <div className="value">
                      {convertToCurrency(
                        this.state.bet_amount / (this.props.qs_game_type - 1) +
                          parseFloat(this.state.bet_amount) /* 0.95 */
                      )}
                    </div>
                  </div>
                  <div className="data-item">
                    <div>
                      <div className="label win-chance">Win Chance</div>
                    </div>
                    <div className="value">{(((this.props.qs_game_type - 1) / this.props.qs_game_type) * 100).toFixed(2)}%</div>
                  </div>
                  <div className="data-item">
                    <div>
                      <div className="label host-display-name">Host</div>
                    </div>
                    <div className="value">{this.props.creator}</div>
                  </div>
                  {this.props.youtubeUrl && 
                  <div className="data-item">
                  <YouTubeVideo url={this.props.youtubeUrl} />
                  </div>}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div
            className="game-info-panel"
            style={{ position: 'relative', zIndex: 10 }}
          >
            <div className="goalBg">
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: goalBg
                }}
                style={{
                  opacity: '0.4'
                }}
              />
            </div>
            <h3 className="game-sub-title">Choose WHERE TO SHOOT</h3>
            <div
              className="qs-image-panel"
              style={{
                zIndex: '1'
              }}
            >
              <img
                src={`/img/gametype/quick_shoot/gametype${
                  this.props.qs_game_type
                }/type${this.props.qs_game_type}-${
                  position_short_name[this.state.selected_qs_position]
                }.png`}
                alt=""
                style={{
                  width: '600px',
                  maxWidth: '100%',
                  borderRadius: '10px'
                }}
              />
              {this.renderButtons()}
            </div>
           
            <BetAmountInput
          betAmount={this.state.bet_amount}
          handle2xButtonClick={this.handle2xButtonClick}
          handleHalfXButtonClick={this.handleHalfXButtonClick}
          handleMaxButtonClick={this.handleMaxButtonClick}
          onChange={this.handleChange}
          isDarkMode={this.props.isDarkMode}
        />
            <SettingsOutlinedIcon
              id="btn-rps-settings"
              onClick={() =>
                this.setState({
                  settings_panel_opened: !this.state.settings_panel_opened
                })
              }
            />
            <div
              ref={this.settingsRef}
              className={`transaction-settings ${
                this.state.settings_panel_opened ? 'active' : ''
              }`}
            >
              <h5>AI Play Settings</h5>
              <p>CHOOSE AN ALGORITHM</p>
              <div className="tiers">
                <table>
                  <tbody>
                    <tr>
                      <td>Speed</td>
                      <td>
                        <div className="bar" style={{ width: '100%' }}></div>
                      </td>
                      <td>
                        <div className="bar" style={{ width: '100%' }}></div>
                      </td>
                      <td>
                        <div className="bar" style={{ width: '80%' }}></div>
                      </td>
                    </tr>
                    <tr>
                      <td>Reasoning</td>
                      <td>
                        <div className="bar" style={{ width: '50%' }}></div>
                      </td>
                      <td>
                        <div className="bar" style={{ width: '0%' }}></div>
                      </td>
                      <td>
                        <div className="bar" style={{ width: '0%' }}></div>
                      </td>
                    </tr>
                    <tr>
                      <td>Abilities</td>
                      <td>
                        <div className="bar" style={{ width: '30%' }}></div>
                      </td>
                      <td>
                        <div className="bar" style={{ width: '0%' }}></div>
                      </td>
                      <td>
                        <div className="bar" style={{ width: '0%' }}></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="slippage-select-panel">
                <Button
                  className={this.state.slippage === 100 ? 'active' : ''}
                  onClick={() => {
                    this.setState({ slippage: 100 });
                  }}
                >
                  Markov
                </Button>
                <Button
                  className="disabled"
                  // className={this.state.slippage === 200 ? 'active' : ''}
                  onClick={() => {
                    this.setState({ slippage: 200 });
                  }}
                  disabled={this.state.isDisabled}
                >
                  Carlo
                </Button>
                <Button
                  className="disabled"
                  // className={this.state.slippage === 500 ? 'active' : ''}
                  onClick={() => {
                    this.setState({ slippage: 500 });
                  }}
                  disabled={this.state.isDisabled}
                >
                  Q Bot
                </Button>
                {/* <button
                  className={this.state.slippage === 'unlimited' ? 'active' : ''}
                  onClick={() => {
                    this.setState({ slippage: 'unlimited' });
                  }}
                >
                  V4
                </button> */}
              </div>
            </div>
            <Button
              id="aiplay"
              onMouseDown={this.handleButtonClick}
              onMouseUp={this.handleButtonRelease}
              onTouchStart={this.handleButtonClick}
              onTouchEnd={this.handleButtonRelease}
            >
              {this.state.betting ? (
                <div id="stop">
                  <span>Stop</span>
                  <Lottie options={defaultOptions} width={22} />
                </div>
              ) : (
                <div>
                  {this.state.timerValue !== 2000 ? (
                    <span>{(this.state.timerValue / 2000).toFixed(2)}s</span>
                  ) : (
                    <span>AI Play</span>
                  )}
                </div>
              )}
            </Button>
          </div>
          <BetArray arrayName={arrayName} label="qs" />

          <div className="action-panel">
            <Share roomInfo={this.props.roomInfo} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  socket: state.auth.socket,
  isAuthenticated: state.auth.isAuthenticated,
  isPasswordCorrect: state.snackbar.isPasswordCorrect,
  balance: state.auth.balance,
  isDarkMode: state.auth.isDarkMode,
  balance: state.auth.balance,
  creator: state.logic.curRoomInfo.creator_name,
  betResults: state.logic.betResults
});

const mapDispatchToProps = {
  openGamePasswordModal
};
export default connect(mapStateToProps, mapDispatchToProps)(QuickShoot);
