import React, { Component } from 'react';
import { connect } from 'react-redux';
import BetArray from '../../components/BetArray';
import Share from '../../components/Share';
import { openGamePasswordModal } from '../../redux/Notification/notification.actions';
import { updateDigitToPoint2 } from '../../util/helper';
import { Button, TextField } from '@material-ui/core';
import { YouTubeVideo } from '../../components/YoutubeVideo';
import BetAmountInput from '../../components/BetAmountInput';
import Lottie from 'react-lottie';
import starsBg from '../LottieAnimations/stars-bg.json';
import {
  validateIsAuthenticated,
  validateCreatorId,
  validateBetAmount,
  validateLocalStorageLength,
  validateBankroll
} from '../modal/betValidations';

import animationData from '../LottieAnimations/spinningIcon';
import Avatar from '../../components/Avatar';
import {
  alertModal,
  confirmModalCreate,
  gameResultModal
} from '../modal/ConfirmAlerts';
import history from '../../redux/history';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import { convertToCurrency } from '../../util/conversion';
import { LensOutlined } from '@material-ui/icons';

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const styles = {
  focused: {
    borderColor: '#fa3fa0'
  }
};

const options = [
  { classname: 'rock', selection: 'R' },
  { classname: 'paper', selection: 'P' },
  { classname: 'scissors', selection: 'S' }
];

const calcWinChance = prevStates => {
  let total = prevStates.length;
  let rock = 0;
  let paper = 0;
  let scissors = 0;
  prevStates.map(el => {
    if (el.rps === 'R') {
      rock++;
    } else if (el.rps === 'P') {
      paper++;
    } else if (el.rps === 'S') {
      scissors++;
    }
  });
  const rockWinChance = (rock / total) * 100;
  const paperWinChance = (paper / total) * 100;
  const scissorsWinChance = (scissors / total) * 100;
  let lowest = rockWinChance;
  let highest = rockWinChance;
  if (paperWinChance < lowest) {
    lowest = paperWinChance;
  }
  if (scissorsWinChance < lowest) {
    lowest = scissorsWinChance;
  }
  if (paperWinChance > highest) {
    highest = paperWinChance;
  }
  if (scissorsWinChance > highest) {
    highest = scissorsWinChance;
  }
  if (lowest === highest) {
    return lowest.toFixed(2) + '%';
  }
  return lowest.toFixed(2) + '% - ' + highest.toFixed(2) + '%';
};

const predictNext = rps_list => {
  // Create a transition matrix to store the probability of transitioning from one state to another
  const transitionMatrix = {
    R: {
      R: {
        R: { R: 0, P: 0, S: 0 },
        P: { R: 0, P: 0, S: 0 },
        S: { R: 0, P: 0, S: 0 }
      },
      P: {
        R: { R: 0, P: 0, S: 0 },
        P: { R: 0, P: 0, S: 0 },
        S: { R: 0, P: 0, S: 0 }
      },
      S: {
        R: { R: 0, P: 0, S: 0 },
        P: { R: 0, P: 0, S: 0 },
        S: { R: 0, P: 0, S: 0 }
      }
    },
    P: {
      R: {
        R: { R: 0, P: 0, S: 0 },
        P: { R: 0, P: 0, S: 0 },
        S: { R: 0, P: 0, S: 0 }
      },
      P: {
        R: { R: 0, P: 0, S: 0 },
        P: { R: 0, P: 0, S: 0 },
        S: { R: 0, P: 0, S: 0 }
      },
      S: {
        R: { R: 0, P: 0, S: 0 },
        P: { R: 0, P: 0, S: 0 },
        S: { R: 0, P: 0, S: 0 }
      }
    },
    S: {
      R: {
        R: { R: 0, P: 0, S: 0 },
        P: { R: 0, P: 0, S: 0 },
        S: { R: 0, P: 0, S: 0 }
      },
      P: {
        R: { R: 0, P: 0, S: 0 },
        P: { R: 0, P: 0, S: 0 },
        S: { R: 0, P: 0, S: 0 }
      },
      S: {
        R: { R: 0, P: 0, S: 0 },
        P: { R: 0, P: 0, S: 0 },
        S: { R: 0, P: 0, S: 0 }
      }
    }
  };

  // Iterate through the previous states to populate the transition matrix
  for (let i = 0; i < rps_list.length - 3; i++) {
    transitionMatrix[rps_list[i].rps][rps_list[i + 1].rps][rps_list[i + 2].rps][
      rps_list[i + 3].rps
    ]++;
  }

  // Normalize the transition matrix
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

  // Check for consistency
  const winChance = calcWinChance(rps_list);
  let deviation = 0;
  if (winChance !== '33.33%') {
    deviation = (1 - 1 / 3) / 2;
  }
  // Use the transition matrix to predict the next state based on the current state
  let currentState1 = rps_list[rps_list.length - 3].rps;
  let currentState2 = rps_list[rps_list.length - 2].rps;
  let currentState3 = rps_list[rps_list.length - 1].rps;
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

  // Add randomness
  let randomNum = Math.random();
  if (randomNum < deviation) {
    let randomState = '';
    do {
      randomNum = Math.random();
      if (randomNum < 1 / 3) {
        randomState = 'R';
      } else if (randomNum < 2 / 3) {
        randomState = 'P';
      } else {
        randomState = 'S';
      }
    } while (randomState === currentState3);
    nextState = randomState;
  }
  return nextState;
};

class RPS extends Component {
  constructor(props) {
    super(props);

    this.settingsRef = React.createRef();
    this.socket = this.props.socket;
    this.state = {
      betting: false,
      timer: null,
      timerValue: 2000,
      intervalId: null,
      items: [],
      rps1Received: false,
      bgColorChanged: false,
      selected_rps: '',
      startedPlaying: false,
      advanced_status: '',
      is_anonymous: false,
      bet_amount: 1,
      bankroll: parseFloat(this.props.bet_amount) - this.getPreviousBets(),
      rps: [],
      betResult: null,
      balance: this.props.balance,
      isPasswordCorrect: this.props.isPasswordCorrect,
      slippage: 100,
      betResults: props.betResults,
      settings_panel_opened: false
    };
    this.panelRef = React.createRef();
    this.onChangeState = this.onChangeState.bind(this);
  }

  onChangeState(e) {
    this.setState({ bet_amount: e.target.value });
    this.setState({ potential_return: e.target.value * 2 });
  }

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

  changeBgColor = async result => {
    this.setState({ betResult: result, bgColorChanged: true });
    await new Promise(resolve => setTimeout(resolve, 2500)); // Wait for 1 second
    this.setState({ bgColorChanged: false });
  };

  handleClickOutside = e => {
    if (this.settingsRef && !this.settingsRef.current.contains(e.target)) {
      this.setState({ settings_panel_opened: false });
    }
  };

  componentDidMount = () => {
    const items = [
      {
        label: 'Host',
        value: this.props.creator
      },
      {
        label: 'Bankroll',
        value: convertToCurrency(this.state.bankroll)
      },
      {
        label: 'Bet Amount',
        value: convertToCurrency(this.state.bet_amount)
      },
      {
        label: 'Potential Return',
        value: convertToCurrency(
          updateDigitToPoint2(this.state.bet_amount * 2 /* * 0.95 */)
        )
      }
    ];
    this.setState({ items });
    const { socket } = this.props;
    socket.on('UPDATED_BANKROLL', data => {
      this.setState({
        bankroll: data.bankroll,
        rps: data.rps,
        startedPlaying: true
      });
    });
    socket.on('RPS_1', data => {
      if (!this.state.rps1Received) {
        this.setState({
          rps: data,
          rps1Received: true
        });
      }
    });
    socket.emit('emitRps'); // Request RPS data on load
    document.addEventListener('mousedown', this.handleClickOutside);
  };
  

  componentWillUnmount = () => {
    clearInterval(this.state.intervalId);
    document.removeEventListener('mousedown', this.handleClickOutside);
  };

  static getDerivedStateFromProps(props, current_state) {
    if (
      current_state.balance !== props.balance ||
      current_state.isPasswordCorrect !== props.isPasswordCorrect
    ) {
      return {
        ...current_state,
        isPasswordCorrect: props.isPasswordCorrect,
        balance: props.balance
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { roomInfo } = this.props;
    const { isPasswordCorrect, selected_rps } = this.state;

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
      this.joinGame(selected_rps);
    }
  }

  joinGame = async () => {
    const {
      rps_bet_item_id,
      isDarkMode,
      refreshHistory,
      join,
      playSound
    } = this.props;

    const { selected_rps, is_anonymous, slippage, bet_amount } = this.state;
    // console.log(selected_rps);
    const result = await join({
      bet_amount: parseFloat(bet_amount),
      selected_rps: selected_rps,
      is_anonymous: is_anonymous,
      rps_bet_item_id: rps_bet_item_id,
      slippage: slippage
    });

    let text;
    if (result.betResult === 1) {
      playSound('win');
      text = 'WINNER, WINNER, VEGAN DINNER!';
      this.changeBgColor(result.betResult);
    } else if (result.betResult === 0) {
      text = 'SPLIT! EQUAL MATCH!';
      playSound('split');
      this.changeBgColor(result.betResult);
    } else {
      text = 'TROLLOLOLOL! LOSER!';
      playSound('lose');
      this.changeBgColor(result.betResult);
    }

    gameResultModal(
      isDarkMode,
      text,
      result.betResult,
      'Okay',
      null,
      () => {},
      () => {}
    );

    if (result.status === 'success') {
      const { user, room } = this.props;
      this.setState(prevState => ({
        betResults: [
          ...prevState.betResults,
          { ...result, user: user, room: room }
        ]
      }));
    } else {
      if (result.message) {
        alertModal(isDarkMode, result.message);
      }
    }

    let stored_rps_array = JSON.parse(localStorage.getItem('rps_array')) || [];
    while (stored_rps_array.length >= 20) {
      stored_rps_array.shift();
    }
    stored_rps_array = stored_rps_array.filter(item => item && item.rps);

    stored_rps_array.push({ rps: selected_rps });
    localStorage.setItem('rps_array', JSON.stringify(stored_rps_array));

    refreshHistory();
  };

  onBtnBetClick = async () => {
    const {
      openGamePasswordModal,
      isAuthenticated,
      isDarkMode,
      creator_id,
      user_id,
      balance,
      is_private,
      roomInfo
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

    if (!validateBankroll(bet_amount, bankroll, isDarkMode)) {
      return;
    }

    const rooms = JSON.parse(localStorage.getItem('rooms')) || {};
    const passwordCorrect = rooms[roomInfo._id];

    if (localStorage.getItem('hideConfirmModal') === 'true') {
      if (is_private === true && passwordCorrect !== true) {
        openGamePasswordModal();
      } else {
        await this.joinGame();
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

  handleHalfXButtonClick = () => {
    const multipliedBetAmount = this.state.bet_amount * 0.5;
    const roundedBetAmount = Math.floor(multipliedBetAmount * 100) / 100;
    this.setState(
      {
        bet_amount: roundedBetAmount
      },
      () => {
        document.getElementById('betamount').focus();
      }
    );
  };

  handle2xButtonClick = () => {
    const maxBetAmount = this.state.balance;
    const multipliedBetAmount = this.state.bet_amount * 2;
    const limitedBetAmount = Math.min(
      multipliedBetAmount,
      maxBetAmount,
      this.props.bet_amount
    );
    const roundedBetAmount = Math.floor(limitedBetAmount * 100) / 100;
    if (roundedBetAmount < -2330223) {
      alertModal(
        this.props.isDarkMode,
        "NOW, THAT'S GETTING A BIT CRAZY NOW ISN'T IT?"
      );
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
    const maxBetAmount = Math.floor(this.state.balance * 100) / 100; // Round down to two decimal places
    this.setState(
      {
        bet_amount: Math.min(maxBetAmount, this.props.bet_amount)
      },
      () => {
        document.getElementById('betamount').focus();
      }
    );
  };

  handleButtonClick = () => {
    const { isAuthenticated, isDarkMode, creator_id, user_id } = this.props;
    const { betting } = this.state;

    if (!validateIsAuthenticated(isAuthenticated, isDarkMode)) {
      return;
    }

    if (!validateCreatorId(creator_id, user_id, isDarkMode)) {
      return;
    }
    if (!betting) {
      this.setState({
        timer: setInterval(() => {
          this.setState(state => {
            if (state.timerValue === 0) {
              clearInterval(this.state.timer);
              this.startBetting();
              return { timerValue: 2000 };
            } else {
              return { timerValue: state.timerValue - 10 };
            }
          });
        }, 10)
      });
    } else {
      this.stopBetting();
    }
  };


  handleButtonRelease = () => {
    if (this.state.timer) {
      clearInterval(this.state.timer);
      this.setState({ timerValue: 2000 });
    }
  };

  startBetting = () => {
    const {
      isDarkMode,
      playSound,
      is_private,
      openGamePasswordModal,
      roomInfo
    } = this.props;

    const storageName = 'rps_array';
    if (!validateLocalStorageLength(storageName, isDarkMode)) {
      return;
    }
    const stored_rps_array =
      JSON.parse(localStorage.getItem(storageName)) || [];
    const intervalId = setInterval(() => {
      const randomItem = predictNext(stored_rps_array);
      const rooms = JSON.parse(localStorage.getItem('rooms')) || {};
      const passwordCorrect = rooms[roomInfo._id];
      if (is_private === true && passwordCorrect !== 'true') {
        openGamePasswordModal();
      } else {
        this.joinGame2(randomItem);
      }
    }, 3500);
    playSound('start');
    this.setState({ intervalId, betting: true });
  };

  stopBetting = () => {
    this.props.playSound('stop');
    clearInterval(this.state.intervalId);
    this.setState({ intervalId: null, betting: false, timerValue: 2000 });
  };

  joinGame2 = async randomItem => {
    const {
      rps_bet_item_id,
      balance,
      isDarkMode,
      refreshHistory,
      playSound
    } = this.props;
    const {
      bet_amount,
      bankroll,
      slippage,
      is_anonymous,
      selected_rps,
      betting
    } = this.state;

    // Check if betting is true before continuing
    if (!betting) {
      return;
    }

    this.setState({ selected_rps: randomItem });

    if (!validateBetAmount(bet_amount, balance, isDarkMode)) {
      return;
    }
    if (!validateBankroll(bet_amount, bankroll, isDarkMode)) {
      return;
    }

    const result = await this.props.join({
      bet_amount: parseFloat(bet_amount),
      selected_rps: selected_rps,
      is_anonymous: is_anonymous,
      rps_bet_item_id: rps_bet_item_id,
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
      let text = 'HAHAA, YOU LOST!!!';

      if (result.betResult === 1) {
        playSound('win');

        text = 'NOT BAD, WINNER!';
        this.changeBgColor(result.betResult);
      } else if (result.betResult === 0) {
        playSound('split');

        text = 'DRAW, NO WINNER!';
        this.changeBgColor(result.betResult);
      } else {
        this.changeBgColor(result.betResult); // Add this line
        playSound('lose');
      }

      refreshHistory();
    }
  };

  render() {
    const rpsValueAtIndex0 = this.state.rps[0]?.rps; // Ensure rps[0] exists and access its rps property

    return (
      <div className="game-page">
        <div className="page-title">
          <h2>PLAY - RPS</h2>
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
                        updateDigitToPoint2(
                          this.state.bet_amount * 2 /* * 0.95 */
                        )
                      )}
                    </div>
                  </div>
                  <div className="data-item">
                    <div>
                      <div className="label win-chance">Win Chance</div>
                    </div>
                    <div className="value">33%</div>
                  </div>
                  <div className="data-item">
                    <div>
                      <div className="label host-display-name">Host</div>
                    </div>
                    <div className="value">{this.props.creator}</div>
                  </div>
                  {this.props.youtubeUrl && (
                    <div className="data-item">
                      <YouTubeVideo url={this.props.youtubeUrl} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div
            className="game-info-panel"
            style={{ position: 'relative', zIndex: 10 }}
          >
            <div className="starsBg">
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: starsBg
                }}
                style={{
                  opacity: '0.2'
                }}
              />
            </div>
            <div className="guesses">
              {this.state.rps.map((item, index) => (
                <p key={index}>{item.rps}</p>
              ))}
            </div>

            {this.state.startedPlaying && (
              <div id="rps-radio" style={{ zIndex: 1 }} className="fade-in">
                <div
                  className={`rps-option ${
                    this.state.rps[0]?.rps === 'R' ? 'rock' : ''
                  }${rpsValueAtIndex0 === 'R' ? ' active' : ''}${
                    this.state.bgColorChanged &&
                    this.state.betResult === -1 &&
                    rpsValueAtIndex0 === 'R'
                      ? ' win-bg'
                      : ''
                  }${
                    this.state.betResult === 0 && rpsValueAtIndex0 === 'R'
                      ? ' draw-bg'
                      : ''
                  }${
                    this.state.betResult === 1 && rpsValueAtIndex0 === 'R'
                      ? ' lose-bg'
                      : ''
                  }`}
                ></div>
                <div
                  className={`rps-option ${
                    this.state.rps[0]?.rps === 'P' ? 'paper' : ''
                  }${rpsValueAtIndex0 === 'P' ? ' active' : ''}${
                    this.state.bgColorChanged &&
                    this.state.betResult === -1 &&
                    rpsValueAtIndex0 === 'P'
                      ? ' win-bg'
                      : ''
                  }${
                    this.state.betResult === 0 && rpsValueAtIndex0 === 'P'
                      ? ' draw-bg'
                      : ''
                  }${
                    this.state.betResult === 1 && rpsValueAtIndex0 === 'P'
                      ? ' lose-bg'
                      : ''
                  }`}
                ></div>
                <div
                  className={`rps-option ${
                    this.state.rps[0]?.rps === 'S' ? 'scissors' : ''
                  }${rpsValueAtIndex0 === 'S' ? ' active' : ''}${
                    this.state.bgColorChanged &&
                    this.state.betResult === -1 &&
                    rpsValueAtIndex0 === 'S'
                      ? ' win-bg'
                      : ''
                  }${
                    this.state.betResult === 0 && rpsValueAtIndex0 === 'S'
                      ? ' draw-bg'
                      : ''
                  }${
                    this.state.betResult === 1 && rpsValueAtIndex0 === 'S'
                      ? ' lose-bg'
                      : ''
                  }`}
                ></div>
              </div>
            )}
            {!this.state.startedPlaying ? (
              <h3 style={{ zIndex: 9 }} className="game-sub-title">
                Select: Rock - Paper - Scissors!
              </h3>
            ) : (
              <h3 style={{ zIndex: 9 }} className="game-sub-title fade-out">
                Select: Rock - Paper - Scissors!
              </h3>
            )}

            <div id="rps-radio" style={{ zIndex: 1 }}>
              {options.map(({ classname, selection }) => (
                <Button
                  variant="contained"
                  id={`rps-${classname}`}
                  className={`rps-option ${classname}${
                    this.state.selected_rps === selection ? ' active' : ''
                  }${
                    this.state.bgColorChanged &&
                    this.state.betResult === -1 &&
                    this.state.selected_rps === selection
                      ? ' lose-bg'
                      : ''
                  }${
                    this.state.betResult === 0 &&
                    this.state.selected_rps === selection
                      ? ' draw-bg'
                      : ''
                  }${
                    this.state.betResult === 1 &&
                    this.state.selected_rps === selection
                      ? ' win-bg'
                      : ''
                  }`}
                  onClick={() => {
                    this.setState({ selected_rps: selection }, () => {
                      this.onBtnBetClick(selection);
                    });
                    this.props.playSound('select');
                  }}
                />
              ))}
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
              variant="contained"
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
          <BetArray arrayName="rps_array" label="rps" />

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
  isDarkMode: state.auth.isDarkMode,
  balance: state.auth.balance,
  creator: state.logic.curRoomInfo.creator_name,
  betResults: state.logic.betResults
});

const mapDispatchToProps = {
  openGamePasswordModal

  // updateBetResult: (betResult) => dispatch(updateBetResult(betResult))
};

export default connect(mapStateToProps, mapDispatchToProps)(RPS);
