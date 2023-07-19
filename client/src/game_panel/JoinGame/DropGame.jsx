import React, { Component } from 'react';
import { connect } from 'react-redux';
import BetArray from '../../components/BetArray';
import { openGamePasswordModal } from '../../redux/Notification/notification.actions';
import { updateDigitToPoint2 } from '../../util/helper';
import { YouTubeVideo } from '../../components/YoutubeVideo';

import Lottie from 'react-lottie';
import gemBg from '../LottieAnimations/gem-bg.json';

import { Button, ButtonGroup, TextField } from '@material-ui/core';
import InlineSVG from 'react-inlinesvg';
import {
  validateIsAuthenticated,
  validateCreatorId,
  validateBetAmount,
  validateLocalStorageLength
} from '../modal/betValidations';

import animationData from '../LottieAnimations/spinningIcon';
import drop from '../LottieAnimations/drop.json';
import Avatar from '../../components/Avatar';
import BetAmountInput from '../../components/BetAmountInput';
import {
  alertModal,
  confirmModalCreate,
  gameResultModal
} from '../modal/ConfirmAlerts';
import history from '../../redux/history';
import Share from '../../components/Share';

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
    if (counts[state.drop_amount]) {
      counts[state.drop_amount]++;
    } else {
      counts[state.drop_amount] = 1;
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

class DropGame extends Component {
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
      showAnimation: false,
      bgColorChanged: false,
      drop_guesses: [],
      advanced_status: '',
      is_anonymous: false,
      bet_amount: 2.00,
      bankroll: parseFloat(this.props.bet_amount) - this.getPreviousBets(),
      drop_guesses1Received: false,
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
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 1 second
    this.setState({ bgColorChanged: false });
  };

  handleClickOutside = e => {
    if (this.settingsRef && !this.settingsRef.current.contains(e.target)) {
      this.setState({ settings_panel_opened: false });
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
    this.socket.on('DROP_GUESSES1', data => {
      if (!this.state.drop_guesses1Received) {
        this.setState({
          drop_guesses: data,
          drop_guesses1Received: true
        });
      }
    });
    this.socket.on('DROP_GUESSES', data => {
      this.setState({ drop_guesses: data });
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
  };
  

  predictNext = dropAmounts => {
    // Find the unique values in dropAmounts
    const uniqueValues = [...new Set(dropAmounts.map(drop => drop.drop))];

    if (uniqueValues.length === 1) {
      return uniqueValues[0];
    } else {
      // Otherwise, compute the range and generate a random number within that range
      const minValue = Math.min(...uniqueValues);
      const maxValue = Math.max(...uniqueValues);
      const rangeSize = Math.ceil((maxValue - minValue) / 200);

      const rangeCounts = {};
      dropAmounts.forEach(drop => {
        const range = Math.floor((drop.drop - minValue) / rangeSize);
        rangeCounts[range] = rangeCounts[range] ? rangeCounts[range] + 1 : 1;
      });

      const totalCounts = dropAmounts.length;
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

    this.setState({ bet_amount: this.state.bet_amount });
    const result = await this.props.join({
      bet_amount: parseFloat(this.state.bet_amount),
      is_anonymous: this.state.is_anonymous,
      drop_bet_item_id: this.props.drop_bet_item_id
      // slippage: this.state.slippage
    });

    let text = 'HAHAA, YOU LOST!!!';

    if (result.betResult === 1) {
      playSound('win');
      text = 'WINNER, WINNER, VEGAN DINNER!';
      // this.changeBgColor(result.betResult);
    } else if (result.betResult === 0) {
      text = 'SPLIT! EQUAL MATCH!';
      playSound('split');
      // this.changeBgColor(result.betResult);
    } else {
      text = 'TROLLOLOLOL! LOSER!';
      playSound('lose');
      // this.changeBgColor(result.betResult);
    }

    let stored_drop_array =
      JSON.parse(localStorage.getItem('drop_array')) || [];

    while (stored_drop_array.length >= 20) {
      stored_drop_array.shift();
    }
    stored_drop_array.push({ drop: this.state.bet_amount });
    localStorage.setItem('drop_array', JSON.stringify(stored_drop_array));

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
    this.props.playSound('select');
    this.setState({ showAnimation: true });
    setTimeout(() => {
      this.setState({ showAnimation: false });
    }, 5000);
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

  handleBetAmountChange = event => {
    this.setState({ bet_amount: event.target.value });
  };

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

    if (!validateLocalStorageLength('drop_array', isDarkMode)) {
      return;
    }
    const stored_drop_array =
      JSON.parse(localStorage.getItem('drop_array')) || [];

    const intervalId = setInterval(() => {
      const randomItem = this.predictNext(stored_drop_array);

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

  handleChange = (event) => {
    this.setState({ bet_amount: event.target.value });
  };

  stopBetting = () => {
    this.props.playSound('stop');
    clearInterval(this.state.intervalId, this.state.timer);
    this.setState({ intervalId: null, betting: false, timerValue: 2000 });
  };

  joinGame2 = async randomItem => {
    const {
      drop_bet_item_id,
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
      drop_bet_item_id: drop_bet_item_id,
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

  render() {
        const { showAnimation } = this.state;

    return (
      <div className="game-page">

        <div className="page-title">
          <h2>PLAY - Drop Game</h2>
        </div>
        <div className="game-contents">
          <div
            className="pre-summary-panel"
            ref={this.panelRef}
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
                      <div className="label your-max-return">
                        Potential Return
                      </div>
                    </div>
                    <div className="value">
                      {convertToCurrency(
                        updateDigitToPoint2(
                          this.state.bet_amount * 2 
                        )
                      )}
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
            <div className="gemBg" 
            >

            <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: gemBg
              }}
        style={{ filter: 'hue-rotate(321deg)'}}
            />
                    </div>
            <div className="game-info-panel">
              <h3 className="game-sub-title">Previous Drops</h3>
              <div className="gradient-container">
                <p className="previous-guesses drop">
                  <div>
                    {this.state.drop_guesses.length > 0 ? (
                      this.state.drop_guesses.map((guess, index) => (
                        <span
                          key={index}
                          style={{
                            background:
                              guess.host_drop > guess.bet_amount
                                ? '#e30303c2'
                                : '#e3e103c2',

                            border: '3px solid',
                            borderColor:
                              guess.host_drop > guess.bet_amount
                                ? '#e30303'
                                : '#e3e103',
                            padding: '0.3em 0.2em'
                          }}
                        >
                          <InlineSVG id="busd" src={require('./busd.svg')} />{' '}
                          {guess.host_drop.toFixed(2)}
                        </span>
                      ))
                    ) : (
                      <span id="no-guesses">No drops yet</span>
                    )}
                  </div>
                  <div>
                    {this.state.drop_guesses.length > 0 ? (
                      this.state.drop_guesses.map((guess, index) => (
                        <span
                          key={index}
                          style={{
                            background:
                              guess.host_drop > guess.bet_amount
                                ? '#e3e103c2'
                                : '#e30303c2',
                            border: '3px solid',
                            borderColor:
                              guess.host_drop > guess.bet_amount
                                ? '#e3e103'
                                : '#e30303',
                            padding: '0.3em 0.2em'
                          }}
                        >
                          <InlineSVG id="busd" src={require('./busd.svg')} />{' '}
                          {guess.bet_amount.toFixed(2)}
                        </span>
                      ))
                    ) : (
                      <span id="no-guesses"></span>
                    )}
                  </div>
                </p>
              </div>
            </div>
            <div className={`animation-container${showAnimation ? ' animate' : ''}`}>
          <Lottie
            options={{
              loop: true,
              autoplay: true,
              animationData: drop,
            }}
            width={200}
            height={200}
            style={{
              filter: 'hue-rotate(95deg)'

            }}
          />
          </div>
            <div className="drop-amount">
              <h3 className="game-sub-title">Highest Drop Wins!</h3>
            </div>
            <BetAmountInput
          betAmount={this.state.bet_amount}
          handle2xButtonClick={this.handle2xButtonClick}
          handleHalfXButtonClick={this.handleHalfXButtonClick}
          handleMaxButtonClick={this.handleMaxButtonClick}
          onChange={this.handleChange}
          isDarkMode={this.props.isDarkMode}
        />
                <Button
                  className="place-bet"
                  color="primary"
                  onClick={() => this.onBtnBetClick()}
                  variant="contained"
                >
                  DROP AMOUNT
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
          <BetArray arrayName="drop_array" label="drop" />

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

export default connect(mapStateToProps, mapDispatchToProps)(DropGame);
