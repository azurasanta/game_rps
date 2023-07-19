import React, { Component } from 'react';
import { connect } from 'react-redux';
import { openGamePasswordModal } from '../../redux/Notification/notification.actions';
import { updateDigitToPoint2 } from '../../util/helper';
import Share from '../../components/Share';
import { Button } from '@material-ui/core';
import BetArray from '../../components/BetArray';
import waves from '../LottieAnimations/waves.json';
import bear from '../LottieAnimations/bear.json';
import { YouTubeVideo } from '../../components/YoutubeVideo';
import {
  validateIsAuthenticated,
  validateCreatorId,
  validateBetAmount,
  validateBankroll
} from '../modal/betValidations';
import Lottie from 'react-lottie';
import threedBg from '../LottieAnimations/3d-bg.json';

import animationData from '../LottieAnimations/spinningIcon';
import {
  alertModal,
  gameResultModal
} from '../modal/ConfirmAlerts';
import history from '../../redux/history';
import { convertToCurrency } from '../../util/conversion';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

class Spleesh extends Component {
  constructor(props) {
    super(props);
    this.socket = this.props.socket;
    this.settingsRef = React.createRef();

    this.state = {
      betting: false,
      timer: null,
      timerValue: 2000,
      holdTime: 0,
      intervalId: null,
      spleesh_guesses1Received: false,
      items: [],
      bet_amount: this.props.spleesh_bet_unit,
      advanced_status: '',
      spleesh_guesses: [],
      is_anonymous: false,
      balance: this.props.balance,
      isPasswordCorrect: false,
      settings_panel_opened: false
    };
    this.panelRef = React.createRef();
  }

  static getDerivedStateFromProps(props, current_state) {
    if (
      current_state.isPasswordCorrect !== props.isPasswordCorrect ||
      current_state.balance !== props.balance
    ) {
      return {
        ...current_state,
        balance: props.balance,
        isPasswordCorrect: props.isPasswordCorrect
      };
    }

    return null;
  }

  onShowButtonClicked = e => {
    e.preventDefault();
  };

  handleClickOutside = e => {
    if (this.settingsRef && !this.settingsRef.current.contains(e.target)) {
      this.setState({ settings_panel_opened: false });
    }
  };
  static getDerivedStateFromProps(props, currentState) {
    if (
      currentState.isPasswordCorrect !== props.isPasswordCorrect ||
      currentState.balance !== props.balance
    ) {
      return {
        ...currentState,
        balance: props.balance,
        isPasswordCorrect: props.isPasswordCorrect
      };
    }
    return null;
  }
  
  onShowButtonClicked = (e) => {
    e.preventDefault();
  };
  
  handleClickOutside = (e) => {
    if (this.settingsRef && !this.settingsRef.current.contains(e.target)) {
      this.setState({ settings_panel_opened: false });
    }
  };
  
  componentDidMount() {
    this.socket.on('SPLEESH_GUESSES', (data) => {
      this.setState({ spleesh_guesses: data });
    });
    this.socket.on('SPLEESH_GUESSES1', (data) => {
      if (!this.state.spleesh_guesses1Received) {
        this.setState({
          spleesh_guesses: data,
          spleesh_guesses1Received: true
        });
      }
    });
    document.addEventListener('mousedown', this.handleClickOutside);
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.isPasswordCorrect !== this.state.isPasswordCorrect &&
      this.state.isPasswordCorrect === true
    ) {
      this.props.join({
        bet_amount: this.state.bet_amount,
        is_anonymous: this.state.is_anonymous
      });
    }
  }
  
  componentWillUnmount = () => {
    clearInterval(this.state.intervalId);
    document.removeEventListener('mousedown', this.handleClickOutside);
  };
  joinGame = async () => {
    const { is_anonymous, bet_amount } = this.state;
    const {
      spleesh_bet_unit,
      playSound,
      refreshHistory,
      isDarkMode,
      join
    } = this.props;
  
    const result = await join({
      bet_amount: bet_amount,
      is_anonymous: is_anonymous
    });
  
    if (result.status === 'success') {
      let text = 'HAHAA, YOU LOST!!!';
      playSound('lose');
      if (result.betResult === 1) {
        text = 'NOT BAD, WINNER!';
        playSound('win');
      } else if (result.betResult === 0) {
        text = 'DRAW, NO WINNER!';
        playSound('split');
      }
  
      let stored_spleesh_array =
        JSON.parse(localStorage.getItem('spleesh_array')) || [];
      let stored_spleesh_10_array =
        JSON.parse(localStorage.getItem('spleesh_10_array')) || [];
  
      while (stored_spleesh_array.length >= 30) {
        stored_spleesh_array.shift();
      }
  
      if (spleesh_bet_unit === 10) {
        while (stored_spleesh_10_array.length >= 30) {
          stored_spleesh_10_array.shift();
        }
        stored_spleesh_10_array.push({ spleesh: bet_amount });
        localStorage.setItem(
          'spleesh_10_array',
          JSON.stringify(stored_spleesh_10_array)
        );
      } else {
        stored_spleesh_array.push({ spleesh: bet_amount });
        localStorage.setItem(
          'spleesh_array',
          JSON.stringify(stored_spleesh_array)
        );
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
            // history.push('/');
          },
          () => {}
        );
      }
    } else {
      if (result.message) {
        alertModal(isDarkMode, result.message);
      }
    }
    refreshHistory();
  };
  
  joinGame2 = async (nextGuess, shouldStopBetting) => {
    const { is_anonymous } = this.state;
    const { playSound, refreshHistory, join } = this.props;
  
    if (shouldStopBetting) {
      this.stopBetting();
      return;
    }
  
    const result = await join({
      bet_amount: nextGuess,
      is_anonymous: is_anonymous
    });
  
    if (result.status === 'success') {
      let text = 'HAHAA, YOU LOST!!!';
      playSound('lose');
      if (result.betResult === 1) {
        text = 'NOT BAD, WINNER!';
        playSound('win');
      } else if (result.betResult === 0) {
        text = 'DRAW, NO WINNER!';
        playSound('split');
      }
    }
  
    refreshHistory();
  };
  
  onBtnBetClick = async (bet_amount) => {
    const {
      isAuthenticated,
      isDarkMode,
      creator_id,
      user_id,
      balance,
      is_private,
      roomInfo,
      openGamePasswordModal
    } = this.props;
  
    const { bankroll } = this.state;
  
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
  
    const hideConfirmModal =
      localStorage.getItem('hideConfirmModal') === 'true';
  
    if (hideConfirmModal || is_private !== true || passwordCorrect === true) {
      await this.joinGame(bet_amount);
    } else {
      openGamePasswordModal();
    }
  };
  
  createNumberPanel = () => {
    const { spleesh_guesses } = this.state;
    let panel = [];
  
    for (let i = 1; i <= 10; i++) {
      const betAmount = i * this.props.spleesh_bet_unit;
      const isDisabled = spleesh_guesses.some((item) => item.bet_amount === betAmount);
  
      panel.push(
        <button
          className={`${
            this.state.bet_amount / this.props.spleesh_bet_unit === i ? 'active' : ''
          } ${isDisabled ? 'disabled' : ''}`}
          onClick={() => {
            const endgameAmount = this.props.spleesh_bet_unit * (55 - i);
            this.setState(
              {
                bet_amount: betAmount,
                endgame_amount: endgameAmount
              },
              () => {
                this.onBtnBetClick(betAmount);
                this.props.playSound('select');
              }
            );
          }}
          key={i}
          disabled={isDisabled}
        >
          {convertToCurrency(i * this.props.spleesh_bet_unit)}
        </button>
      );
    }
  
    return panel;
  };
  

  predictNext = (array1, array2) => {
    const frequencyMap = {};
    let maxValue = 0;
    let maxKey = 0;

    array1.forEach(item => {
      if (!frequencyMap[item.spleesh]) {
        frequencyMap[item.spleesh] = 0;
      }
      frequencyMap[item.spleesh] += 1;

      if (frequencyMap[item.spleesh] > maxValue) {
        maxValue = frequencyMap[item.spleesh];
        maxKey = item.spleesh;
      }
    });

    const spleeshValues = Object.keys(frequencyMap);

    let prediction = maxKey;
    let i = 0;
    const maxAttempts = spleeshValues.length * 1;
    let shouldStopBetting = false;
    while (array2.some(item => item.bet_amount === prediction)) {
      const randomIndex = Math.floor(Math.random() * spleeshValues.length);
      prediction = Number(spleeshValues[randomIndex]);

      i++;
      if (i >= maxAttempts) {
        alertModal(this.props.isDarkMode, `NO MORE AVAILABLE OPTIONS MTF!!`);
        shouldStopBetting = true;
        break;
      }
    }

    return { prediction, shouldStopBetting };
  };

  handleButtonClick = () => {
    this.props.playSound('select');
    if (!this.state.betting) {
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
    this.props.playSound('start');
    const intervalId = setInterval(() => {
      let storageKey = 'spleesh_array';
      if (this.props.spleesh_bet_unit === 10) {
        storageKey = 'spleesh_10_array';
      }

      if (storageKey.length < 3) {
        alertModal(this.props.isDarkMode, 'MORE TRAINING DATA NEEDED!');
        return;
      }

      const predictionResult = this.predictNext(
        JSON.parse(localStorage.getItem(storageKey)),
        this.state.spleesh_guesses
      );
      const nextGuess = predictionResult.prediction;
      const shouldStopBetting = predictionResult.shouldStopBetting;
      this.joinGame2(nextGuess, shouldStopBetting);
    }, 3500);

    this.setState({ intervalId, betting: true });
  };

  stopBetting = () => {
    this.props.playSound('stop');
    clearInterval(this.state.intervalId);
    this.setState({ intervalId: null, betting: false, timerValue: 2000 });
  };


  render() {
    const { spleesh_bet_unit, endgame_amount } = this.props;
  const { spleesh_guesses } = this.state;
  let arrayName;
  if (spleesh_bet_unit === 1) {
    arrayName = 'spleesh_array';
  } else if (spleesh_bet_unit === 10) {
    arrayName = 'spleesh_10_array';
  }

  const guessedAmounts = spleesh_guesses.map((number) => number.bet_amount);
  const remainingSum = endgame_amount - guessedAmounts.reduce((sum, amount) => sum + amount, 0);

  let minSum = 0;
  let minGuesses = 0;
  let minStep = 1;

  if (spleesh_bet_unit === 10) {
    for (let i = 100; i >= 10; i -= 10) {
      if (!guessedAmounts.includes(i)) {
        minSum += i;
        minGuesses++;
        if (minSum >= remainingSum) {
          break;
        }
      }
    }
  } else {
    for (let i = 10; i >= 1; i--) {
      if (!guessedAmounts.includes(i)) {
        minSum += i;
        minGuesses++;
        if (minSum >= remainingSum) {
          break;
        }
      }
    }
  }

  let maxSum = 0;
  let maxGuesses = 0;
  let maxStep = 1;

  if (spleesh_bet_unit === 10) {
    for (let i = 10; i <= 100; i += 10) {
      if (!guessedAmounts.includes(i)) {
        maxSum += i;
        maxGuesses++;
        if (maxSum >= remainingSum) {
          break;
        }
      }
    }
  } else {
    for (let i = 1; i <= 10; i++) {
      if (!guessedAmounts.includes(i)) {
        maxSum += i;
        maxGuesses++;
        if (maxSum >= remainingSum) {
          break;
        }
      }
    }
  }

  let remainingGuessesText = `${minGuesses} - ${maxGuesses}`;
  if (minGuesses === maxGuesses) {
    remainingGuessesText = minGuesses === 1 ? `${minGuesses} guess` : `${minGuesses} guesses`;
  }

  const averageGuesses = (minGuesses + maxGuesses) / 2;
  const marginTopMin = -200;
  const marginTopMax = 200;
  const marginTop = marginTopMin + ((averageGuesses - 1) / 9) * (marginTopMax - marginTopMin);
  const marginTopScaled = marginTop;

    return (
      <div className="game-page">
        <div className="page-title">
          <h2>
            PLAY - <i>Spleesh!</i>
          </h2>
        </div>
        <div className="game-contents">
          <div
            className="pre-summary-panel"
            ref={this.panelRef}
            // onScroll={this.handleScroll}
          >
            <div className="pre-summary-panel__inner spleesh">
              {[...Array(1)].map((_, i) => (
                <React.Fragment key={i}>
                  <div className="data-item">
                    <div>
                      <div className="label room-id">STATUS</div>
                    </div>
                    <div className="value">{this.props.roomInfo.status}</div>
                  </div>
                 
                  <div className="data-item">
                    <div className="label your-max-return">Your Return</div>
                    <div className="value">
                      {convertToCurrency(
                        updateDigitToPoint2(
                          this.state.spleesh_guesses.reduce(
                            (a, b) => a + b.bet_amount,
                            0
                          ) +
                            this.state.bet_amount * 2 /* 0.9 */
                        )
                      )}
                    </div>
                  </div>
                  <div className="data-item">
                    <div>
                      <div className="label win-chance">Win Chance</div>
                    </div>
                    <div className="value">{((averageGuesses / (10 - this.state.spleesh_guesses.length)) * 100).toFixed(2)}%</div>
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
            <div className="threedBg">
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: threedBg
                }}
                style={{
                  filter: 'hue-rotate(99deg)',
                }}
              />
            </div>
            
             <div className="waves">

             <Lottie
        options={{
          loop: true,
          autoplay: true,
          animationData: waves
        }}
        style={{
          zIndex: '-1',
          left: '0',
          position: 'absolute',
          filter: 'invert(1)',
          maxWidth: '100%',
          marginTop: `${marginTopScaled}px`
        }}
      />
              </div>
              <div className="mosquito" style={{
                zIndex: '-2',
                display: 'flex',
                justifyContent: 'center',
              }}>
            <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: bear
              }}
              style={{
                position: 'absolute',
              }}
            />
            </div>
            <h3 className="game-sub-title">{remainingGuessesText} remaining</h3>

            <div id="select-buttons-panel">{this.createNumberPanel()}</div>
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
          <BetArray arrayName={arrayName} label="spleesh" />

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
  creator: state.logic.curRoomInfo.creator_name
});

const mapDispatchToProps = {
  openGamePasswordModal
};

export default connect(mapStateToProps, mapDispatchToProps)(Spleesh);
