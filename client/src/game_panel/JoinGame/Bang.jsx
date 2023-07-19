import React, { Component } from 'react';
import { connect } from 'react-redux';
import BetArray from '../../components/BetArray';
import CountUp from 'react-countup';
import Share from '../../components/Share';
import { openGamePasswordModal } from '../../redux/Notification/notification.actions';
import { updateDigitToPoint2 } from '../../util/helper';
import { Button, TextField } from '@material-ui/core';
import { YouTubeVideo } from '../../components/YoutubeVideo';
import BetAmountInput from '../../components/BetAmountInput';
import {
  validateIsAuthenticated,
  validateCreatorId,
  validateBetAmount,
  validateLocalStorageLength
} from '../modal/betValidations';
import Lottie from 'react-lottie';
import rocksBg from '../LottieAnimations/rocksBg.json';
import bomb from '../LottieAnimations/bomb.json';
import explosion from '../LottieAnimations/explosion.json';
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

const calcWinChance = prevStates => {
  let total = prevStates.length;
  let counts = {};
  prevStates.forEach(state => {
    if (counts[state.bang_amount]) {
      counts[state.bang_amount]++;
    } else {
      counts[state.bang_amount] = 1;
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

class Bang extends Component {
  constructor(props) {
    super(props);

    this.settingsRef = React.createRef();
    this.runsRef = React.createRef();
    this.socket = this.props.socket;
    this.state = {
      betting: false,
      timer: null,
      timerValue: 2000,
      intervalId: null,
      requestId: null,
      nextBangInterval: null,
      countdown: null,
      items: [],
      executeBet: false,
      newRound: false,
      bgColorChanged: false,
      countupValue: 0,
      buttonClicked: false,
      cashoutAmount: 1,
      bang_guesses: [],
      advanced_status: '',
      waiting: false,
      is_anonymous: false,
      bet_amount: 1,
      bankroll: parseFloat(this.props.bet_amount) - this.getPreviousBets(),
      bang_guesses1Received: false,
      multiplier: 1.01,
      crashed: true,
      betResult: null,
      balance: this.props.balance,
      isPasswordCorrect: this.props.isPasswordCorrect,
      slippage: 100,
      listen: true,
      betResults: props.betResults,
      settings_panel_opened: false,
      runs_panel_opened: false
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
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 1 second
    this.setState({ bgColorChanged: false });
  };

  handleClickOutside = e => {
    if (this.settingsRef && !this.settingsRef.current.contains(e.target)) {
      this.setState({ settings_panel_opened: false });
    }
    if (this.runsRef && !this.runsRef.current.contains(e.target)) {
      this.setState({ runs_panel_opened: false });
    }
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
    const {
      waiting,
      newRound,
      showBang,
      showCountdown,
      executeBet,
      cashoutAmount
    } = this.state;
  
    const { playSound, playSoundLoop, stopSound } = this.props;
  
    if (!showBang && !showCountdown) {
      stopSound('countDown');
      // playSoundLoop('fuse');
    } else if (showBang || !showCountdown) {
      // stopSound('fuse');
      playSound('bang');
    } else if (showCountdown || !showBang) {
      stopSound('bang');
      // stopSound('fuse');
      playSound('countDown');
    }
  
    if (!showBang && !showCountdown && waiting && newRound && !executeBet) {
      this.setState(
        {
          newRound: false,
          executeBet: true,
          crashed: false,
          cashoutAmount: cashoutAmount
        },
        () => {
          this.onBtnBetClick();
        }
      );
    }
  
    if (prevProps.roomInfo && this.props.roomInfo) {
      if (prevProps.roomInfo.bet_amount !== this.props.roomInfo.bet_amount) {
        this.setState({
          bankroll:
            parseFloat(this.props.roomInfo.bet_amount) - this.getPreviousBets()
        });
      }
    }
  
    if (
      prevState.isPasswordCorrect !== this.state.isPasswordCorrect &&
      this.state.isPasswordCorrect === true
    ) {
      this.joinGame();
    }
  }
  
  componentDidMount = () => {
    const roomId = this.props.roomInfo._id;
    this.socket.on(`BANG_GUESSES_${roomId}`, data => {
      if (data && data.bangs && data.bangs.length > 0) {
        const lastBang = data.bangs[data.bangs.length - 1];
        const nextBangInterval = lastBang;
        this.setState({
          bang_guesses: data.bangs,
          nextBangInterval: nextBangInterval
        });
      }
    });
  
    this.socket.on(`BANG_GUESSES1_${roomId}`, data => {
      if (data && data.bangs && data.bangs.length > 0 && this.state.listen) {
        const lastBang = data.bangs[data.bangs.length - 1];
        // console.log('lastBang', lastBang);
        const nextBangInterval = lastBang;
        this.setState({
          bang_guesses: data.bangs,
          nextBangInterval: nextBangInterval,
          elapsedTime: data.elapsedTime,
          listen: false
        });
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
        value: convertToCurrency(
          updateDigitToPoint2(this.state.bet_amount * 2 /* * 0.95 */)
        )
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
    clearInterval(this.state.intervalId);
    document.removeEventListener('mousedown', this.handleClickOutside);
    this.socket.off(`BANG_GUESSES_${this.props.roomInfo._id}`);
    this.socket.off(`BANG_GUESSES1_${this.props.roomInfo._id}`);
    this.socket.off('UPDATED_BANKROLL');
  };
  

  predictNext = bangAmounts => {
    // Find the unique values in bangAmounts
    const uniqueValues = [...new Set(bangAmounts.map(bang => bang.bang))];

    if (uniqueValues.length === 1) {
      // If there is only one unique value, return that value
      return uniqueValues[0];
    } else {
      // Otherwise, compute the range and generate a random number within that range
      const minValue = Math.min(...uniqueValues);
      const maxValue = Math.max(...uniqueValues);
      const rangeSize = Math.ceil((maxValue - minValue) / 200);

      const rangeCounts = {};
      bangAmounts.forEach(bang => {
        const range = Math.floor((bang.bang - minValue) / rangeSize);
        rangeCounts[range] = rangeCounts[range] ? rangeCounts[range] + 1 : 1;
      });

      const totalCounts = bangAmounts.length;
      const rangeProbabilities = {};
      Object.keys(rangeCounts).forEach(range => {
        const rangeProbability = rangeCounts[range] / totalCounts;
        rangeProbabilities[range] = rangeProbability;
      });

      let randomValue = Math.random();
      let chosenRange = null;
      Object.entries(rangeProbabilities).some(([range, probability]) => {
        randomValue -= probability;
        if (randomValue <= 0) {
          chosenRange = range;
          return true;
        }
        return false;
      });

      const rangeMinValue = parseInt(chosenRange) * rangeSize + minValue;
      const rangeMaxValue = Math.min(rangeMinValue + rangeSize, maxValue);

      const getRandomNumberInRange = (min, max) => {
        return Math.random() * (max - min) + min;
      };
      return parseFloat(
        getRandomNumberInRange(rangeMinValue, rangeMaxValue).toFixed(2)
      );
    }
  };

  joinGame = async () => {
    const { playSound } = this.props;
    const result = await this.props.join({
      bet_amount: parseFloat(this.state.bet_amount),
      crashed: this.state.crashed,
      multiplier: this.state.multiplier,
      cashoutAmount: this.state.cashoutAmount
      // slippage: this.state.slippage
    });

    let text = 'HAHAA, YOU LOST!!!';

    if (result.betResult === 1) {
      playSound('win');
      text = 'WINNER, WINNER, VEGAN DINNER!';
    } else if (result.betResult === 0) {
      text = 'SPLIT! EQUAL MATCH!';
      playSound('split');
    } else {
      text = 'TROLLOLOLOL! LOSER!';
      playSound('lose');
    }

    let stored_bang_array =
      JSON.parse(localStorage.getItem('bang_array')) || [];

    while (stored_bang_array.length >= 20) {
      stored_bang_array.shift();
    }
    stored_bang_array.push({ bang: this.state.bet_amount });
    localStorage.setItem('bang_array', JSON.stringify(stored_bang_array));

    gameResultModal(
      this.props.isDarkMode,
      text,
      result.betResult,
      'Okay',
      null,
      () => {
        // history.push('/');
      },
      () => {}
    );

    if (result.status === 'success') {
      const currentUser = this.props.user;
      const currentRoom = this.props.room;
      this.setState(prevState => ({
        betResults: [
          ...prevState.betResults,
          { ...result, user: currentUser, room: currentRoom }
        ]
      }));
    } else {
      if (result.message) {
        alertModal(this.props.isDarkMode, result.message);
      }
    }

    this.props.refreshHistory();
  };

  onBtnBetClick = async () => {
    const { isAuthenticated, isDarkMode, creator_id, user_id } = this.props;
    const { buttonClicked, waiting, executeBet } = this.state;

    if (!validateIsAuthenticated(isAuthenticated, isDarkMode)) {
      return;
    }

    if (!validateCreatorId(creator_id, user_id, isDarkMode)) {
      return;
    }

    if (!buttonClicked) {
      if (!waiting) {
        this.setState({ waiting: true });
      } else if (!executeBet) {
        this.resetButtonState();
      } else {
        this.startAutoCashout();
      }
    } else {
      this.pushBet();
    }
  };

  pushBet = async () => {
    const {
      openGamePasswordModal,
      balance,
      isDarkMode,
      is_private,
      roomInfo
    } = this.props;
    const { cashoutAmount } = this.state;

    cancelAnimationFrame(this.state.requestId);
    await validateBetAmount(cashoutAmount, balance, isDarkMode);

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
      cashoutAmount: 1,
      newRound: false,
      waiting: false,
      executeBet: false,
      requestId: null
    });
  };

  startAutoCashout = () => {
    const { bet_amount, multiplier } = this.state;
    let cashoutAmount = 1;
    const increment = 0.01;
    let previousTimestamp = null;
    const animate = timestamp => {
      if (!previousTimestamp) {
        previousTimestamp = timestamp;
      }
      const elapsed = timestamp - previousTimestamp;
      if (elapsed >= 8.3303) {
        cashoutAmount += increment * Math.floor(elapsed / 8.3303);
        this.setState({ cashoutAmount });
        previousTimestamp = timestamp;
      }
      if (cashoutAmount >= multiplier) {
        this.setState({ cashoutAmount: multiplier, crashed: false }, () => {
          this.pushBet();
        });
        return;
      } else if (cashoutAmount >= this.state.nextBangInterval) {
        this.setState({ crashed: true }, () => {
          this.pushBet();
        });
        return;
      }
      const requestId = window.requestAnimationFrame(animate);
      this.setState({ requestId });
    };
    const requestId = window.requestAnimationFrame(animate);
    this.setState({ buttonClicked: true, cashoutAmount, requestId });
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

  handleMaxButtonClick = () =>  {
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

    if (!validateLocalStorageLength('bang_array', isDarkMode)) {
      return;
    }
    const stored_bang_array =
      JSON.parse(localStorage.getItem('bang_array')) || [];

    const intervalId = setInterval(() => {
      const randomItem = this.predictNext(stored_bang_array);

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
      bang_bet_item_id,
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
      bang_bet_item_id: bang_bet_item_id,
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
      } else if (result.betResult === 0) {
        playSound('split');

        text = 'DRAW, NO WINNER!';
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
      bang_guesses,
      nextBangInterval,
      showBang,
      elapsedTime,
      showCountdown,
      waiting,
      newRound
    } = this.state;
    const { playSound, playSoundLoop, stopSound } = this.props;
    // Determine whether to show the countup animation or the bang message
    let content;
    if (showBang) {
      if (
        elapsedTime &&
        elapsedTime / 1000 > nextBangInterval &&
        elapsedTime / 1000 < nextBangInterval + 2
      ) {
        const bangDuration = 2 - (elapsedTime / 1000 - nextBangInterval);

        content = (
          <div>
            {' '}
            <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: explosion
              }}
              style={{
                filter: 'hue-rotate(312deg)',
                maxWidth: '100%',
                width: '300px',
                marginBottom: '-50px'

                // position: 'absolute',
                // transform: 'translate: (50%, 50%)'
              }}
            />
            <span id="bang-text">
              {' '}
              BANG
              <br /> @ x{nextBangInterval.toFixed(2)}!
            </span>
            <br />
            {setTimeout(
              () => this.setState({ elapsedTime: '' }),
              bangDuration * 1000
            )}
          </div>
        );
      } else {
        content = (
          <div>
            {' '}
            <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: explosion
              }}
              style={{
                maxWidth: '100%',
                width: '300px',
                marginBottom: '-50px'
                // position: 'absolute',
                // transform: 'translate: (50%, 50%)'
              }}
            />
            <span id="bang-text">
              {' '}
              BANG
              <br /> @ x{nextBangInterval.toFixed(2)}!
            </span>
          </div>
        );
      }
    } else if (showCountdown) {
      content = (
        <span id="nextBangIn">Next Bang in...{this.state.countdown}</span>
      );
    } else {
      let countupStart;
      if (elapsedTime && elapsedTime / 1000 > nextBangInterval + 2) {
        countupStart = nextBangInterval;
        // console.log("p sherman");
        const countdownStart = Math.ceil(
          5 - (elapsedTime / 1000 - nextBangInterval - 2)
        );
        if (countdownStart > 0) {
          setTimeout(() => {
            this.setState({
              showBang: false,
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
            }, 1000);
          });
        } else {
          content = (
            <div>
              <p>
                <div id="x">x</div>
                <CountUp
                  start={countupStart}
                  end={nextBangInterval}
                  decimals={2}
                  duration={
                    elapsedTime
                      ? nextBangInterval - elapsedTime / 1000
                      : nextBangInterval
                  }
                  useEasing={false}
                  // easingFn={(t, b, c, d) => c * (t / d) * (t / d) + b}
                  onEnd={() => {
                    // Show the bang message for 2 seconds, then start the countdown
                    this.setState({
                      showBang: true
                    });
                    setTimeout(() => {
                      this.setState({
                        showBang: false,
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
                    }, 2000);
                  }}
                />
              </p>
            </div>
          );
          this.setState({ elapsedTime: '' });
        }
      } else if (elapsedTime && elapsedTime / 1000 > nextBangInterval) {
        const bangStart = nextBangInterval;
        const bangDuration =
          2000 - (elapsedTime / 1000 - nextBangInterval) * 1000;
        if (bangDuration > 0) {
          content = (
            <div>
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: explosion
                }}
                style={{
                  filter: 'hue-rotate(312deg)',
                  maxWidth: '100%',
                  width: '300px',
                  marginBottom: '-50px'

                  // position: 'absolute',
                  // transform: 'translate: (50%, 50%)'
                }}
              />
              <span id="bang-text">
                {' '}
                BANG
                <br /> @ x{nextBangInterval.toFixed(2)}!
              </span>
            </div>
          );
        } else {
          content = (
            <div>
              <Lottie
                id="bomb"
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: bomb
                }}
                style={{
                  filter: 'hue-rotate(312deg)',
                  maxWidth: '100%',
                  width: '250px',
                  // position: 'absolute',
                  marginRight: '-30px',
                  marginBottom: '-30px',
                  transform: 'translateY(20px)'
                }}
              />
              <p>
                <div id="x">x</div>
                <CountUp
                  start={countupStart}
                  end={nextBangInterval}
                  decimals={2}
                  duration={
                    elapsedTime
                      ? nextBangInterval - elapsedTime / 1000
                      : nextBangInterval
                  }
                  useEasing={false}
                  // easingFn={(t, b, c, d) => c * (t / d) * (t / d) + b}
                  onEnd={() => {
                    this.setState({
                      showBang: true
                    });
                    setTimeout(() => {
                      this.setState({
                        showBang: false,
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
                    }, 2000);
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
            <Lottie
              id="bomb"
              options={{
                loop: true,
                autoplay: true,
                animationData: bomb
              }}
              style={{
                filter: 'hue-rotate(312deg)',
                maxWidth: '100%',
                width: '300px',
                // position: 'absolute',
                marginLeft: '60px',
                marginBottom: '30px',
                transform: 'translateY(20px)'
              }}
            />
            <p>
              <div id="x">x</div>
              <CountUp
                start={countupStart}
                end={nextBangInterval}
                decimals={2}
                duration={
                  elapsedTime
                    ? nextBangInterval - elapsedTime / 1000
                    : nextBangInterval
                }
                useEasing={false}
                // easingFn={(t, b, c, d) => c * (t / d) * (t / d) + b}
                onEnd={() => {
                  // Show the bang message for 2 seconds, then start the countdown
                  this.setState({
                    showBang: true
                  });
                  setTimeout(() => {
                    this.setState({
                      showBang: false,
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
                    }, 1000);
                  }, 2000);
                }}
              />
            </p>
          </div>
        );
      }
    }

    return (
      <div className="game-page">
        <div className="page-title">
          <h2>PLAY - Bang!</h2>
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
            <div className="rocksBg">
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: rocksBg
                }}
              />
            </div>
            <div className="game-info-panel">
              <div
                onClick={() =>
                  this.setState({
                    runs_panel_opened: !this.state.runs_panel_opened
                  })
                }
                style={{
                  background: '#f8f9fa54',
                  padding: '4px 10px',
                  borderRadius: '7px',
                  marginTop: '30px'
                }}
              >
                {' '}
                <h5>View All Bangs</h5>
              </div>
              <div
                ref={this.runsRef}
                className={`runs-modal ${
                  this.state.runs_panel_opened ? 'active' : ''
                }`}
              >
                <h5>LAST 100</h5>

                <div className="slippage-select-panel">
                  <div>
                    {bang_guesses
                      .slice(-101, -1)
                      .reverse()
                      .map((bang, index) => (
                        <div
                          style={{
                            textAlign: 'center',
                            borderRadius: '5px',
                            marginBottom: '1px',
                            border: '2px solid',
                            backgroundColor:
                              bang < 2.0 ? '#e3e103c2' : '#e30303c2',
                            borderColor: bang < 2.0 ? '#e3e103c2' : '#e30303c2'
                          }}
                          key={index}
                        >
                          {bang}x
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <div className="gradient-container">
                <p className="previous-guesses drop">
                  <div>
                    {this.state.bang_guesses.length > 0 ? (
                      this.state.bang_guesses
                        .slice(0, -1)
                        .map((guess, index) => (
                          <span
                            key={index}
                            style={{
                              background: guess < 2 ? '#e3e103c2' : '#e30303c2',
                              border: '3px solid',
                              borderColor: guess < 2 ? '#e3e103' : '#e30303',
                              padding: '0.3em 0.2em',
                              textAlign: 'center'
                            }}
                          >
                            x{guess.toFixed(2)}
                          </span>
                        ))
                    ) : (
                      <span id="no-guesses"></span>
                    )}
                  </div>
                  {/* <div>
                    {this.state.bang_guesses.length > 0 ? (
                      this.state.bang_guesses.map((guess, index) => (
                        <span
                          key={index}
                          style={{
                            background:
                              guess.host_bang > guess.bet_amount
                                ? '#e3e103c2'
                                : '#e30303c2',
                            padding: '0.3em 0.9em'
                          }}
                        >
                          <InlineSVG id="busd" src={require('./busd.svg')} />{' '}
                          {guess.bet_amount.toFixed(2)}
                        </span>
                      ))
                    ) : (
                      <span id="no-guesses"></span>
                    )}
                  </div> */}
                </p>
              </div>
            </div>

            <div className="bangTimer">
              {bang_guesses.length ? (
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
              <div className="your-multiplier">
                <TextField
                  type="text"
                  name="multiplier"
                  variant="outlined"
                  id="betamount"
                  label="AUTO CASH OUT"
                  value={this.state.multiplier}
                  onChange={event =>
                    this.setState({ multiplier: event.target.value })
                  }
                  inputProps={{
                    pattern: '[0-9]*',
                    maxLength: 9
                  }}
                  InputLabelProps={{
                    shrink: true
                  }}
                  InputProps={{
                    endAdornment: 'x'
                  }}
                />
              </div>

              <Button
                className="place-bet"
                color="primary"
                onClick={() => this.onBtnBetClick()}
                variant="contained"
              >
                {this.state.buttonClicked ? (
                  `Cash Out @ ${parseFloat(this.state.cashoutAmount).toFixed(
                    2
                  )}`
                ) : this.state.waiting ? (
                  <span style={{ animation: 'blink 0.75s linear infinite' }}>
                    Joining Next Round
                  </span>
                ) : (
                  'BANG OUT'
                )}
              </Button>
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
                  <Lottie options={defaultOptions} width={22} />
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
          <BetArray arrayName="bang_array" label="bang" />

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

export default connect(mapStateToProps, mapDispatchToProps)(Bang);
