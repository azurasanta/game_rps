import React, { Component } from 'react';
import { connect } from 'react-redux';
import BetArray from '../../components/BetArray';
import CountUp, { linearEasing } from 'react-countup';
import { deductBalanceWhenStartRoll } from '../../redux/Logic/logic.actions';
import { YouTubeVideo } from '../../components/YoutubeVideo';
import BetAmountInput from '../../components/BetAmountInput';
import { openGamePasswordModal } from '../../redux/Notification/notification.actions';
import { updateDigitToPoint2 } from '../../util/helper';
import Lottie from 'react-lottie';
import { Button, TextField } from '@material-ui/core';
import InlineSVG from 'react-inlinesvg';
import {
  validateIsAuthenticated,
  validateCreatorId,
  validateBetAmount,
  validateLocalStorageLength
} from '../modal/betValidations';
import boatBg from '../LottieAnimations/boatBg.json';

import gBg from '../LottieAnimations/g-bg.json';
import portal from '../LottieAnimations/portal.json';
import rollHex from '../LottieAnimations/roll-hex.json';
import pipe from '../LottieAnimations/pipe.json';
import Avatar from '../../components/Avatar';
import {
  alertModal,
  confirmModalCreate,
  gameResultModal
} from '../modal/ConfirmAlerts';
import history from '../../redux/history';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import { convertToCurrency } from '../../util/conversion';
import Share from '../../components/Share';

const defaultOptions = {
  loop: true,
  autoplay: true,
  // animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const calcWinChance = prevStates => {
  let total = prevStates.length;
  let counts = {};
  prevStates.forEach(state => {
    if (counts[state.roll_amount]) {
      counts[state.roll_amount]++;
    } else {
      counts[state.roll_amount] = 1;
    }
  });
  let lowest = Infinity;
  let highest = -Infinity;
  Object.keys(counts).forEach(key => {
    const chance = (counts[key] / total) * 100;
    if (chance < lowest) {
      lowest = chance;
    }
    if (chance > highest) {
      highest = chance;
    }
  });
  if (lowest === highest) {
    return lowest.toFixed(2) + '%';
  }
  return lowest.toFixed(2) + '% - ' + highest.toFixed(2) + '%';
};

class Roll extends Component {
  constructor(props) {
    super(props);

    this.settingsRef = React.createRef();
    this.socket = this.props.socket;
    this.state = {
      betting: false,
      isWaiting: false,
      timer: null,
      timerValue: 2000,
      intervalId: null,
      nextRollInterval: 10,
      countdown: null,
      items: [],
      bgColorChanged: false,
      buttonClicked: false,
      disabledButtons: false,
      roll_guesses: [],
      lastRollGuess: '',
      advanced_status: '',
      waiting: false,
      is_anonymous: false,
      bet_amount: 1,
      bankroll: parseFloat(this.props.bet_amount) - this.getPreviousBets(),
      roll_guesses1Received: false,
      multiplier: 1.01,
      betResult: null,
      balance: this.props.balance,
      isPasswordCorrect: this.props.isPasswordCorrect,
      slippage: 100,
      listen: true,
      selected_roll: '',
      betResults: props.betResults,
      settings_panel_opened: false
    };
    this.panelRef = React.createRef();
    this.sliderRef = React.createRef();
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
    await new Promise(resolve => setTimeout(resolve, 5000));
    this.setState({ bgColorChanged: false });
    if (!this.state.buttonClicked) {
      this.setState({ selected_roll: null });
    }
  };

  handleClickOutside = e => {
    if (this.settingsRef && !this.settingsRef.current.contains(e.target)) {
      this.setState({ settings_panel_opened: false });
    }
  };
  static getDerivedStateFromProps(props, current_state) {
    const { balance, isPasswordCorrect } = props;
    if (current_state.balance !== balance || current_state.isPasswordCorrect !== isPasswordCorrect) {
      return {
        ...current_state,
        isPasswordCorrect,
        balance
      };
    }
    return null;
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { isWaiting, disabledButtons } = this.state;
  
    if (isWaiting && disabledButtons) {
      this.pushBet();
    }
  
    const { roomInfo } = this.props;
    if (prevProps.roomInfo && roomInfo) {
      if (prevProps.roomInfo.bet_amount !== roomInfo.bet_amount) {
        this.setState({
          bankroll: parseFloat(roomInfo.bet_amount) - this.getPreviousBets()
        });
      }
    }
  
    if (prevState.isPasswordCorrect !== this.state.isPasswordCorrect && this.state.isPasswordCorrect) {
      this.joinGame();
    }
  }
  
  componentDidMount = () => {
    this.panelRef.current.addEventListener('scroll', this.handleScroll);
    const roomId = this.props.roomInfo._id;
    this.socket.on(`ROLL_GUESSES_${roomId}`, data => {
      if (data && data.rolls && data.rolls.length > 0) {
        const roll_guesses = data.rolls.map((roll, i) => ({
          roll,
          face: data.faces[i]
        }));
  
        this.startSlider();
        this.props.playSound('sweep');
        this.setState(
          {
            roll_guesses,
            lastRollGuess: roll_guesses[roll_guesses.length - 6].face
          },
          () => {
            setTimeout(() => {
              this.setState({ disabledButtons: true }, () => {
                if (this.state.buttonClicked) {
                  this.props.deductBalanceWhenStartRoll({ bet_amount: this.state.bet_amount });
                }
              });
            }, 1000);
            setTimeout(() => {
              this.props.playSound('shine');
              this.setState({ disabledButtons: false });
             
            }, 10000);
          }
        );
      }
    });
  
    this.socket.on(`ROLL_GUESSES1_${roomId}`, data => {
      if (data && data.rolls && data.rolls.length > 0 && this.state.listen) {
        const roll_guesses = data.rolls.map((roll, i) => ({
          roll,
          face: data.faces[i]
        }));
        this.setState({
          roll_guesses,
          elapsedTime: data.elapsedTime,
          listen: false
        });
        this.startSlider();
      }
    });
  
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
        value: convertToCurrency(updateDigitToPoint2(this.state.bet_amount * 2))
      }
    ];
    this.setState({ items });
  
    const { socket } = this.props;
    socket.on('UPDATED_BANKROLL', data => {
      this.setState({ bankroll: data.bankroll });
    });
  
    document.addEventListener('mousedown', this.handleClickOutside);
  };
  
  componentWillUnmount = () => {
    clearInterval(this.state.intervalId, this.timer);
    document.removeEventListener('mousedown', this.handleClickOutside);
    this.panelRef.current.removeEventListener('scroll', this.handleScroll);
    const roomId = this.props.roomInfo._id;
    this.socket.off(`ROLL_GUESSES_${roomId}`);
    this.socket.off(`ROLL_GUESSES1_${roomId}`);
  };
  

  predictNext = roll_list => {
    const faces = ['R', 'P', 'S', 'W', 'B', 'Bu'];
    const sequence = roll_list.map(roll => roll.face); // New array to store sequence of faces
    const nextStates = {};

    // Determine the probability of each face occurring next based on the previous sequence of faces
    faces.forEach(face => {
      const count = sequence.filter((f, i) => i > 0 && sequence[i - 1] === face)
        .length;
      nextStates[face] = count / Math.max(1, sequence.length - 1);
    });

    // Check if all probabilities are either 0 or 1
    const allProbabilitiesOneOrZero = Object.values(nextStates).every(
      probability => probability === 0 || probability === 1
    );

    // Use the original method of predicting if all probabilities are either 0 or 1
    if (allProbabilitiesOneOrZero) {
      const occurrences = {};
      roll_list.forEach(roll => {
        occurrences[roll.face] = (occurrences[roll.face] || 0) + 1;
      });
      let randomIndex = Math.floor(Math.random() * roll_list.length);
      let nextState = roll_list[randomIndex];
      return { roll: nextState.roll, face: nextState.face };
    }

    // Randomly select the next face based on probabilities
    let nextStateFace = '';
    let randomNum = Math.random();
    let cumulativeProbability = 0;
    for (const face in nextStates) {
      cumulativeProbability += nextStates[face];
      if (randomNum <= cumulativeProbability) {
        nextStateFace = face;
        break;
      }
    }

    // Use the switch statement to determine the rollNumber for the predicted face
    let rollNumber;
    switch (nextStateFace) {
      case 'R':
      case 'P':
      case 'S':
        rollNumber = '2';
        break;
      case 'W':
        rollNumber = '14';
        break;
      case 'B':
        rollNumber = '1.5';
        break;
      case 'Bu':
        rollNumber = '7';
        break;
      default:
        rollNumber = '2';
    }

    return { roll: rollNumber, face: nextStateFace };
  };

  joinGame = async () => {
    const { playSound, join, user, room, isDarkMode } = this.props;
    const { selected_roll, bet_amount } = this.state;
  
    const result = await join({
      bet_amount: parseFloat(bet_amount),
      selected_roll: selected_roll
      // is_anonymous: this.state.is_anonymous,
      // roll_bet_item_id: this.props.roll_bet_item
      // slippage: this.state.slippage
    });
  
    setTimeout(() => {
      let text = 'HAHAA, YOU LOST!!!';
  
      if (result.betResult === 1) {
        playSound('win');
        text = 'WINNER, WINNER, VEGAN DINNER!';
        this.changeBgColor(result.betResult);
      } else {
        text = 'TROLLOLOLOL! LOSER!';
        playSound('lose');
        this.changeBgColor(result.betResult);
      }
  
      let stored_roll_array = JSON.parse(localStorage.getItem('roll_array')) || [];
  
      while (stored_roll_array.length >= 20) {
        stored_roll_array.shift();
      }
      stored_roll_array.push({ roll: bet_amount });
      localStorage.setItem('roll_array', JSON.stringify(stored_roll_array));
  
      if (result.status === 'success') {
        this.setState(prevState => ({
          betResults: [...prevState.betResults, { ...result, user, room }]
        }));
  
        gameResultModal(
          isDarkMode,
          text,
          result.betResult,
          'Okay',
          null,
          () => {
            // history.push('/');
          },
          () => {}
        );
      } else {
        if (result.message) {
          alertModal(isDarkMode, result.message);
        }
      }
  
      this.props.refreshHistory();
    }, 5000);
  };
  
  onBtnBetClick = async () => {
    const { isAuthenticated, isDarkMode, creator_id, user_id, playSound } = this.props;
    const { buttonClicked, isWaiting } = this.state;
    playSound('select');
  
    if (!validateIsAuthenticated(isAuthenticated, isDarkMode)) {
      this.setState({ selected_roll: null, buttonClicked: false });
      return;
    }
  
    if (!validateCreatorId(creator_id, user_id, isDarkMode)) {
      this.setState({ selected_roll: null, buttonClicked: false });
      return;
    }
  
    if (!buttonClicked && isWaiting) {
      return;
    } else {
      setTimeout(() => {
        this.setState({ isWaiting: true });
      }, 3000);
    }
  };
  
  pushBet = async () => {
    const { openGamePasswordModal, balance, isDarkMode, is_private, roomInfo } = this.props;
    const { bet_amount } = this.state;
  
    await validateBetAmount(bet_amount, balance, isDarkMode);
  
    const rooms = JSON.parse(localStorage.getItem('rooms')) || {};
    const passwordCorrect = rooms[roomInfo._id];
  
    if (is_private === true && passwordCorrect !== true) {
      if (localStorage.getItem('hideConfirmModal') === 'true') {
        openGamePasswordModal();
      } else {
        confirmModalCreate(
          isDarkMode,
          'ARE YOU SURE YOU WANT TO PLACE THIS BET?',
          'Yes',
          'Cancel',
          async () => {
            await this.joinGame();
            this.resetButtonState();
          }
        );
      }
    } else {
      await this.joinGame();
      this.resetButtonState();
    }
  };
  
  resetButtonState = () => {
    this.setState({
      buttonClicked: false,
      isWaiting: false
    });
  };
  
  startSlider = () => {
    const sliderImages = this.sliderRef.current;
    if (!sliderImages) return;
  
    let currentPos = 0;
    let startTime = null;
  
    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / 20000, 0.8); // 20 seconds
      const ease = 1 - Math.pow(1 - progress, 10); // cubic easing
  
      currentPos = ease * 0.65 * sliderImages.offsetWidth;
  
      sliderImages.style.transform = `translateX(${sliderImages.offsetWidth / 3 - currentPos}px)`;
  
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
  
    requestAnimationFrame(animate);
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
  }

  handle2xButtonClick = () => {
    const maxBetAmount = this.state.balance;
    const multipliedBetAmount = this.state.bet_amount * 2;
    const limitedBetAmount = Math.min(multipliedBetAmount, maxBetAmount);
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
  }

  handleMaxButtonClick = () => {
    const maxBetAmount = this.state.balance;
    this.setState(
      {
        bet_amount: maxBetAmount
      },
      () => {
        document.getElementById('betamount').focus();
      }
    );
  }

  handleButtonClick = () => {
    const { isAuthenticated, creator_id, user_id, isDarkMode } = this.props;
    const { betting, timer } = this.state;

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
    const { isDarkMode, playSound, is_private, roomInfo } = this.props;

    if (!validateLocalStorageLength('roll_array', isDarkMode)) {
      return;
    }
    const stored_roll_array =
      JSON.parse(localStorage.getItem('roll_array')) || [];

    const intervalId = setInterval(() => {
      const randomItem = this.predictNext(stored_roll_array);

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
    this.props.playSound('stop');
    clearInterval(this.state.intervalId, this.state.timer);
    this.setState({ intervalId: null, betting: false, timerValue: 2000 });
  };

  joinGame2 = async randomItem => {
    const {
      roll_bet_item_id,
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
      betting
    } = this.state;

    // Check if betting is true before continuing
    if (!betting) {
      return;
    }

    this.setState({ bet_amount: randomItem });

    if (!validateBetAmount(bet_amount, balance, isDarkMode)) {
      return;
    }

    const result = await this.props.join({
      bet_amount: parseFloat(bet_amount),
      is_anonymous: is_anonymous,
      roll_bet_item_id: roll_bet_item_id,
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
        // this.changeBgColor(result.betResult);
      } else {
        // this.changeBgColor(result.betResult);
        playSound('lose');
      }

      // gameResultModal(
      //   this.props.isDarkMode,
      //   text,
      //   result.betResult,
      //   'Okay',
      //   null,
      //   () => {
      //     // history.push('/');
      //   },
      //   () => {}
      // );

      refreshHistory();
    }
  };

  handleMultiplierChange = event => {
    const multiplier = event.target.value;
    this.setState({ multiplier });
  };

  render() {
    const {
      roll_guesses,
      nextRollInterval,
      showRoll,
      elapsedTime,
      showCountdown,
      waiting,
      newRound
    } = this.state;
    const { playSound, playSoundLoop, stopSound } = this.props;
    let content;
    if (showRoll) {
      if (
        elapsedTime &&
        elapsedTime / 1000 > nextRollInterval &&
        elapsedTime / 1000 < nextRollInterval
      ) {
        const rollDuration = elapsedTime / 1000 - nextRollInterval;

        content = (
          <div>
            <span id="roll-text">
              {' '}
              ROLL
              <br /> {nextRollInterval.toFixed(2)}
            </span>
            <br />
            {setTimeout(
              () => this.setState({ elapsedTime: '' }),
              rollDuration * 1000
            )}
          </div>
        );
      } else {
        content = (
          <div>
            <span id="roll-text">
              {' '}
              ROLL
              <br /> = {nextRollInterval.toFixed(2)}
            </span>
          </div>
        );
      }
    } else if (showCountdown) {
      content = (
        <div id="nextRollIn">
          <span>Rolling...</span>
        </div>
      );
    } else {
      let countupStart;
      if (elapsedTime && elapsedTime / 1000 > nextRollInterval) {
        countupStart = nextRollInterval;
        const countdownStart = Math.ceil(
          5 - (elapsedTime / 1000 - nextRollInterval)
        );
        if (countdownStart > 0) {
          this.setState({
            showRoll: false,
            showCountdown: true,
            countdown: countdownStart,
            elapsedTime: ''
          });
          // Start the countdown
          const countdownTimer = setInterval(() => {
            const countdown = this.state.countdown - 1;
            if (countdown <= 0) {
              // Countdown is finished, restart everything
              clearInterval(countdownTimer);
              this.setState({
                showCountdown: false,
                countdown: null,
                elapsedTime: ''
              });
              if (this.state.waiting) {
                this.setState({ newRound: true });
              }
            } else {
              this.setState({ countdown, elapsedTime: '' });
            }
          });
        } else {
          content = (
            <div>
              <p>
                <CountUp
                  start={countupStart}
                  end={nextRollInterval}
                  decimals={2}
                  duration={
                    elapsedTime
                      ? nextRollInterval - elapsedTime / 1000
                      : nextRollInterval
                  }
                  useEasing={false}
                  onEnd={() => {
                    // Show the roll message for 2 seconds, then start the countdown
                    this.setState({
                      showRoll: true
                    });
                    this.setState({
                      showRoll: false,
                      showCountdown: true,
                      countdown: 5,
                      elapsedTime: ''
                    });
                    // Start the countdown
                    const countdownTimer = setInterval(() => {
                      const countdown = this.state.countdown - 1;
                      if (countdown <= 0) {
                        // Countdown is finished, restart everything
                        clearInterval(countdownTimer);
                        this.setState({
                          showCountdown: false,
                          countdown: null,
                          elapsedTime: ''
                        });
                        if (this.state.waiting) {
                          this.setState({ newRound: true });
                        }
                      } else {
                        this.setState({ countdown, elapsedTime: '' });
                      }
                    }, 1000);
                  }}
                />
              </p>
            </div>
          );
          this.setState({ elapsedTime: '' });
        }
      } else if (elapsedTime && elapsedTime / 1000 > nextRollInterval) {
        const rollStart = nextRollInterval;
        const rollDuration = (elapsedTime / 1000 - nextRollInterval) * 1000;
        if (rollDuration > 0) {
          content = (
            <div>
              <span id="roll-text">
                {' '}
                ROLL
                <br /> = {nextRollInterval.toFixed(2)}
              </span>
            </div>
          );
        } else {
          content = (
            <div>
              <p>
                <CountUp
                  start={countupStart}
                  end={nextRollInterval}
                  decimals={2}
                  duration={
                    elapsedTime
                      ? nextRollInterval - elapsedTime / 1000
                      : nextRollInterval
                  }
                  useEasing={false}
                  onEnd={() => {
                    this.setState({
                      showRoll: true
                    });
                    this.setState({
                      showRoll: false,
                      showCountdown: true,
                      countdown: 5
                    });
                    // Start the countdown
                    const countdownTimer = setInterval(() => {
                      const countdown = this.state.countdown - 1;
                      if (countdown <= 0) {
                        // Countdown is finished, restart everything
                        clearInterval(countdownTimer);
                        this.setState({
                          showCountdown: false,
                          countdown: null
                        });
                        if (this.state.waiting) {
                          this.setState({ newRound: true });
                        }
                      } else {
                        this.setState({ countdown, elapsedTime: '' });
                      }
                    }, 10);
                  }}
                />
              </p>
            </div>
          );
          this.setState({ elapsedTime: '' });
        }
      } else {
        countupStart = elapsedTime ? elapsedTime / 1000 : 1;
        content = (
          <div>
            <p>
              <CountUp
                start={countupStart}
                end={nextRollInterval}
                decimals={2}
                duration={
                  elapsedTime
                    ? nextRollInterval - elapsedTime / 1000
                    : nextRollInterval
                }
                useEasing={false}
                onEnd={() => {
                  this.setState({
                    showRoll: true
                  });
                  this.setState({
                    showRoll: false,
                    showCountdown: true,
                    countdown: 5
                  });
                  // Start the countdown
                  const countdownTimer = setInterval(() => {
                    const countdown = this.state.countdown - 1;
                    if (countdown <= 0) {
                      clearInterval(countdownTimer);
                      this.setState({
                        showCountdown: false,
                        countdown: null
                      });
                      if (this.state.waiting) {
                        this.setState({ newRound: true });
                      }
                    } else {
                      this.setState({ countdown, elapsedTime: '' });
                    }
                  }, 1000);
                }}
              />
            </p>
          </div>
        );
      }
    }

    return (
      <div className="game-page">
        {/* <h1> DEMO ONLY, GAME UNDER DEVELOPMENT 🚧</h1> */}

        <div className="page-title">
          <h2>PLAY - Roll!</h2>
        </div>
        <div className="game-contents">
          <div
            className="pre-summary-panel"
            ref={this.panelRef}
            onScroll={this.handleScroll}
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
                      <div className="label your-max-return">
                        Ave. Multiplier
                      </div>
                    </div>
                    <div className="value">
                      {convertToCurrency(
                        updateDigitToPoint2(this.props.aveMultiplier)
                      )}
                      x
                    </div>
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
            <div className="boatBg">
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: boatBg
                }}
                style={{ filter: 'hue-rotate(302deg)' }}
              />
            </div>
            
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: rollHex
                }}
                style={{
                  marginTop: '10px',
                  marginBottom: '-155px',
                  filter: 'hue-rotate(45deg)',
                  maxWidth: '100%',
                  width: '160px'
                }}
              />
             

              <div className="slider-images" id="top" ref={this.sliderRef}>
                <p className="previous-guesses roll">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      pointerEvents: 'none'
                    }}
                  >
                    {this.state.roll_guesses.length > 0 ? (
                      this.state.roll_guesses.slice(-30).map((guess, index) => (
                        <div
                          style={{
                            width: '120px',
                            height: '120px',
                            backgroundPosition: 'center',
                            backgroundSize: 'contain',
                            pointerEvents: 'none'
                          }}
                          key={index}
                          alt={guess.face}
                          className={
                            guess.face === 'R'
                              ? 'rock'
                              : guess.face === 'P'
                              ? 'paper'
                              : guess.face === 'S'
                              ? 'scissors'
                              : guess.face === 'W'
                              ? 'whale'
                              : guess.face === 'B'
                              ? 'bear'
                              : guess.face === 'Bu'
                              ? 'bull'
                              : ''
                          }
                        />
                      ))
                    ) : (
                      <span id="no-guesses"></span>
                    )}
                  </div>
                </p>
              </div>
            <div className="rollTimer">
              {roll_guesses.length ? (
                content
              ) : (
                <span id="no-guesses">Connecting...</span>
              )}
            </div>

            <BetAmountInput
          betAmount={this.state.bet_amount}
          handle2xButtonClick={this.handle2xButtonClick}
          handleHalfXButtonClick={this.handleHalfXButtonClick}
          handleMaxButtonClick={this.handleMaxButtonClick}
          onChange={this.handleChange}
          isDarkMode={this.props.isDarkMode}
        />
              <div id="roll">
                <Button
                  className={`rock button-2x-r${
                    this.state.selected_roll === 'R' ? ' active' : ''
                  }${
                    this.state.bgColorChanged &&
                    this.state.betResult === -1 &&
                    this.state.selected_roll === 'R'
                      ? ' lose-bg'
                      : ''
                  }${
                    this.state.betResult === 1 &&
                    this.state.selected_roll === 'R'
                      ? ' win-bg'
                      : ''
                  }`}
                  disabled={this.state.disabledButtons}
                  style={{ opacity: this.state.disabledButtons ? 0.5 : 1 }}
                  variant="contained"
                  onClick={() => {
                    this.onBtnBetClick();

                    const currentActive = document.querySelector('.active');
                    if (currentActive) {
                      currentActive.style.animation = 'none';
                      void currentActive.offsetWidth;
                      currentActive.style.animation = 'pulse 0.2s ease-in-out ';
                    }

                    this.setState(
                      { selected_roll: null, bgColorChanged: false },
                      () => {
                        this.setState({
                          selected_roll: 'R',
                          buttonClicked: true
                        });
                      }
                    );
                  }}
                >
                  <span>2x (4x)</span>
                </Button>
                <Button
                  className={`paper button-2x-p${
                    this.state.selected_roll === 'P' ? ' active' : ''
                  }${
                    this.state.bgColorChanged &&
                    this.state.betResult === -1 &&
                    this.state.selected_roll === 'P'
                      ? ' lose-bg'
                      : ''
                  }${
                    this.state.betResult === 1 &&
                    this.state.selected_roll === 'P'
                      ? ' win-bg'
                      : ''
                  }`}
                  disabled={this.state.disabledButtons}
                  style={{ opacity: this.state.disabledButtons ? 0.5 : 1 }}
                  variant="contained"
                  onClick={() => {
                    this.onBtnBetClick();
                    const currentActive = document.querySelector('.active');
                    if (currentActive) {
                      currentActive.style.animation = 'none';
                      void currentActive.offsetWidth;
                      currentActive.style.animation = 'pulse 0.2s ease-in-out ';
                    }

                    this.setState(
                      {
                        selected_roll: null,
                        betResult: 0,
                        bgColorChanged: false
                      },
                      () => {
                        this.setState({
                          selected_roll: 'P',
                          buttonClicked: true
                        });
                      }
                    );
                  }}
                >
                  <span>2x (4x)</span>
                </Button>
                <Button
                  className={`scissors button-2x-s${
                    this.state.selected_roll === 'S' ? ' active' : ''
                  }${
                    this.state.bgColorChanged &&
                    this.state.betResult === -1 &&
                    this.state.selected_roll === 'S'
                      ? ' lose-bg'
                      : ''
                  }${
                    this.state.betResult === 1 &&
                    this.state.selected_roll === 'S'
                      ? ' win-bg'
                      : ''
                  }`}
                  disabled={this.state.disabledButtons}
                  style={{ opacity: this.state.disabledButtons ? 0.5 : 1 }}
                  variant="contained"
                  onClick={() => {
                    this.onBtnBetClick();
                    const currentActive = document.querySelector('.active');
                    if (currentActive) {
                      currentActive.style.animation = 'none';
                      void currentActive.offsetWidth;
                      currentActive.style.animation = 'pulse 0.2s ease-in-out ';
                    }

                    this.setState(
                      {
                        selected_roll: null,
                        betResult: 0,
                        bgColorChanged: false
                      },
                      () => {
                        this.setState({
                          selected_roll: 'S',
                          buttonClicked: true
                        });
                      }
                    );
                  }}
                >
                  <span>2x (4x)</span>
                </Button>
                <Button
                  className={`whale button-2x-w${
                    this.state.selected_roll === 'W' ? ' active' : ''
                  }${
                    this.state.bgColorChanged &&
                    this.state.betResult === -1 &&
                    this.state.selected_roll === 'W'
                      ? ' lose-bg'
                      : ''
                  }${
                    this.state.betResult === 1 &&
                    this.state.selected_roll === 'W'
                      ? ' win-bg'
                      : ''
                  }`}
                  disabled={this.state.disabledButtons}
                  style={{ opacity: this.state.disabledButtons ? 0.5 : 1 }}
                  variant="contained"
                  onClick={() => {
                    this.onBtnBetClick();
                    const currentActive = document.querySelector('.active');
                    if (currentActive) {
                      currentActive.style.animation = 'none';
                      void currentActive.offsetWidth;
                      currentActive.style.animation = 'pulse 0.2s ease-in-out ';
                    }
                    this.setState(
                      {
                        selected_roll: null,
                        betResult: 0,
                        bgColorChanged: false
                      },
                      () => {
                        this.setState({
                          selected_roll: 'W',
                          buttonClicked: true
                        });
                      }
                    );
                  }}
                >
                  <span>14x</span>
                </Button>
                <Button
                  className={`bear button-2x-b${
                    this.state.selected_roll === 'B' ? ' active' : ''
                  }${
                    this.state.bgColorChanged &&
                    this.state.betResult === -1 &&
                    this.state.selected_roll === 'B'
                      ? ' lose-bg'
                      : ''
                  }${
                    this.state.betResult === 1 &&
                    this.state.selected_roll === 'B'
                      ? ' win-bg'
                      : ''
                  }`}
                  disabled={this.state.disabledButtons}
                  style={{ opacity: this.state.disabledButtons ? 0.5 : 1 }}
                  variant="contained"
                  onClick={() => {
                    this.onBtnBetClick();
                    const currentActive = document.querySelector('.active');
                    if (currentActive) {
                      currentActive.style.animation = 'none';
                      void currentActive.offsetWidth;
                      currentActive.style.animation = 'pulse 0.2s ease-in-out ';
                    }
                    this.setState(
                      {
                        selected_roll: null,
                        betResult: 0,
                        bgColorChanged: false
                      },
                      () => {
                        this.setState({
                          selected_roll: 'B',
                          buttonClicked: true
                        });
                      }
                    );
                  }}
                >
                  <span>1.5x</span>
                </Button>
                <Button
                  className={`bull button-2x-bu${
                    this.state.selected_roll === 'Bu' ? ' active' : ''
                  }${
                    this.state.bgColorChanged &&
                    this.state.betResult === -1 &&
                    this.state.selected_roll === 'Bu'
                      ? ' lose-bg'
                      : ''
                  }${
                    this.state.betResult === 1 &&
                    this.state.selected_roll === 'Bu'
                      ? ' win-bg'
                      : ''
                  }`}
                  disabled={this.state.disabledButtons}
                  style={{ opacity: this.state.disabledButtons ? 0.5 : 1 }}
                  variant="contained"
                  onClick={() => {
                    this.onBtnBetClick();
                    const currentActive = document.querySelector('.active');
                    if (currentActive) {
                      currentActive.style.animation = 'none';
                      void currentActive.offsetWidth;
                      currentActive.style.animation = 'pulse 0.2s ease-in-out ';
                    }
                    this.setState(
                      {
                        selected_roll: null,
                        betResult: 0,
                        bgColorChanged: false
                      },
                      () => {
                        this.setState({
                          selected_roll: 'Bu',
                          buttonClicked: true
                        });
                      }
                    );
                  }}
                >
                  <span>7x</span>
                </Button>
              </div>
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
              className="disabled"
              variant="contained"
              onMouseDown={this.handleButtonClick}
              onMouseUp={this.handleButtonRelease}
              onTouchStart={this.handleButtonClick}
              onTouchEnd={this.handleButtonRelease}
            >
              {this.state.betting ? (
                <div id="stop">
                  <span>Stop</span>
                </div>
              ) : (
                <div>
                  {this.state.timerValue !== 2000 ? (
                    <span>{(this.state.timerValue / 2000).toFixed(2)}s</span>
                  ) : (
                    <span>AI Play (Coming Soon)</span>
                  )}
                </div>
              )}
            </Button>
          </div>
          <BetArray arrayName="roll_array" label="roll" />

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
  openGamePasswordModal,
  deductBalanceWhenStartRoll
  // updateBetResult: (betResult) => dispatch(updateBetResult(betResult))
};

export default connect(mapStateToProps, mapDispatchToProps)(Roll);
