import React, { Component } from 'react';
import { connect } from 'react-redux';
import history from '../../redux/history';
import BetArray from '../../components/BetArray';
import Lottie from 'react-lottie';
import mountainsBg from '../LottieAnimations/mountains-bg.json';
import { YouTubeVideo } from '../../components/YoutubeVideo';

import { Button } from '@material-ui/core';
import {
  validateIsAuthenticated,
  validateCreatorId,
  validateBetAmount,
  validateLocalStorageLength,
  validateBankroll
} from '../modal/betValidations';
import animationData from '../LottieAnimations/spinningIcon';
import { openGamePasswordModal } from '../../redux/Notification/notification.actions';
import { convertToCurrency } from '../../util/conversion';
import { updateDigitToPoint2 } from '../../util/helper';
import { alertModal, confirmModalCreate } from '../modal/ConfirmAlerts';
import ReactModal from 'react-modal';
import Share from '../../components/Share';
import { Card, CardContent, Typography } from '@material-ui/core';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const customStyles = {
  overlay: {
    zIndex: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    background: 'transparent',
    padding: 0,
  }
};

class MysteryBox extends Component {
  constructor(props) {
    super(props);
    this.socket = this.props.socket;
    this.settingsRef = React.createRef();

    this.state = {
      items: [],
      bet_amount: 0,
      selected_id:
        this.props.box_list.length > 0 ? this.props.box_list[0]._id : '',
      box_list: this.props.box_list,
      advanced_status: '',
      is_anonymous: false,
      balance: this.props.balance,
      betResult: this.props.betResult,
      betResults: [],
      isPasswordCorrect: false,
      isOpen: true,
      betting: false,
      timer: null,
      bgColorChanged: false,
      timerValue: 2000,
      intervalId: null,
      settings_panel_opened: false
    };
  }
  static getDerivedStateFromProps(props, current_state) {
    const { isPasswordCorrect, betResult, balance } = props;
  
    if (
      current_state.isPasswordCorrect !== isPasswordCorrect ||
      current_state.betResult !== betResult ||
      current_state.balance !== balance
    ) {
      return {
        ...current_state,
        balance,
        isPasswordCorrect,
        betResult
      };
    }
  
    return null;
  }
  
  onBoxClicked = e => {
    e.preventDefault();
    this.props.playSound('select');
  
    if (e.currentTarget.getAttribute('status') === 'opened') {
      return;
    }
  
    const _id = e.currentTarget.getAttribute('_id');
    const box_price = e.currentTarget.getAttribute('box_price');
    this.setState({ selected_id: _id, bet_amount: box_price }, () => {
      this.onBtnBetClick();
    });
  };
  
  componentDidMount() {
    const { socket } = this.props;
    socket.on('UPDATED_BOX_LIST', data => {
      this.setState({ box_list: data.box_list });
    });
    document.addEventListener('mousedown', this.handleClickOutside);
  }
  
  componentWillUnmount = () => {
    clearInterval(this.state.intervalId);
    document.removeEventListener('mousedown', this.handleClickOutside);
  };
  
  componentDidUpdate(prevProps, prevState) {
    if (prevState.box_list !== this.state.box_list) {
      this.props.refreshHistory(() => {
        if (
          this.state.isPasswordCorrect === true &&
          this.state.selected_id !== null
        ) {
          this.props.join({
            bet_amount: this.state.bet_amount,
            selected_id: this.state.selected_id,
            is_anonymous: this.state.is_anonymous
          });
  
          const updatedBoxList = this.state.box_list.map(el =>
            el._id === this.state.selected_id ? { ...el, status: 'opened' } : el
          );
  
          this.setState({ box_list: updatedBoxList });
        }
      });
    }
  }

  handleClickOutside = e => {
    if (this.settingsRef && !this.settingsRef.current.contains(e.target)) {
      this.setState({ settings_panel_opened: false });
    }
  };

  predictNext = (betAmountArray, boxList) => {
    let transitions = {};
    let probabilities = {};
    let startProbabilities = {};
    let distinctBoxes = [...new Set(boxList)];

    // Calculate start probabilities
    for (let i = 0; i < boxList.length; i++) {
      if (startProbabilities[boxList[i]]) {
        startProbabilities[boxList[i]]++;
      } else {
        startProbabilities[boxList[i]] = 1;
      }
    }

    let totalStartStates = Object.values(startProbabilities).reduce(
      (a, b) => a + b
    );

    for (let box in startProbabilities) {
      startProbabilities[box] /= totalStartStates;
    }

    // Calculate transition probabilities
    for (let i = 0; i < boxList.length - 1; i++) {
      let currentBox = boxList[i];
      let nextBox = boxList[i + 1];

      if (transitions[currentBox]) {
        if (transitions[currentBox][nextBox]) {
          transitions[currentBox][nextBox]++;
        } else {
          transitions[currentBox][nextBox] = 1;
        }
      } else {
        transitions[currentBox] = {};
        transitions[currentBox][nextBox] = 1;
      }
    }

    for (let currentBox in transitions) {
      let currentBoxTransitions = transitions[currentBox];
      let totalCurrentBoxTransitions = Object.values(
        currentBoxTransitions
      ).reduce((a, b) => a + b);

      probabilities[currentBox] = {};

      for (let nextBox in currentBoxTransitions) {
        probabilities[currentBox][nextBox] =
          currentBoxTransitions[nextBox] / totalCurrentBoxTransitions;
      }
    }

    // Make prediction
    let prediction = null;
    let maxProbability = -1;

    const maxBetAmount = Math.max(...betAmountArray);
    betAmountArray = [boxList[boxList.length - 1]];
    for (let i = 0; i < distinctBoxes.length; i++) {
      let currentBox = distinctBoxes[i];
      if (currentBox > maxBetAmount) {
        continue;
      }
      let currentBoxProbability =
        startProbabilities[currentBox] *
        probabilities[currentBox][betAmountArray[betAmountArray.length - 1]];

      if (currentBoxProbability > maxProbability) {
        maxProbability = currentBoxProbability;
        prediction = currentBox;
      }
    }

    return prediction;
  };

  changeBgColor = async result => {
    this.setState({ betResult: result, bgColorChanged: true });
    await new Promise(resolve => setTimeout(resolve, 2500)); // Wait for 1 second
    this.setState({ bgColorChanged: false });
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
      is_private,
      roomInfo,
      openGamePasswordModal,
      playSound
    } = this.props;
    const { box_list } = this.state;

    const storageName = 'bet_array';
    if (!validateLocalStorageLength(storageName, isDarkMode)) {
      return;
    }
    const intervalId = setInterval(() => {
      const stored_bet_array =
        JSON.parse(localStorage.getItem(storageName)) || [];

      const nextBox = this.predictNext(stored_bet_array, box_list);
      const rooms = JSON.parse(localStorage.getItem('rooms')) || {};
      const passwordCorrect = rooms[roomInfo._id];
      if (is_private === true && passwordCorrect !== true) {
        openGamePasswordModal();
      } else {
        this.joinGame2(nextBox.box_price);
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

  joinGame2 = async predictedBetAmount => {
    const {
      bet_amount,
      balance,
      betting,
      box_list,
      selected_id,
      is_anonymous
    } = this.state;
    const { playSound, isDarkMode } = this.props;
    if (!betting) {
      return;
    }
    if (bet_amount > balance) {
      alertModal(isDarkMode, `TOO BROKE!`);
      return;
    }

    const availableBoxes = box_list.filter(
      box => box.status === 'init' && box.box_price <= predictedBetAmount + 8
    );
    if (availableBoxes.length === 0) {
      alertModal(
        isDarkMode,
        `NO MORE AVAILABLE BOXES THAT FIT THE TRAINING DATA`
      );
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableBoxes.length);
    const selectedBox = availableBoxes[randomIndex];
    const result = await this.props.join({
      bet_amount: parseFloat(bet_amount),
      selected_id: selectedBox._id,
      is_anonymous: is_anonymous
      // slippage: this.state.slippage
    });
    this.setState({ selected_id: selectedBox._id });

    const currentUser = this.props.user;
    const currentRoom = this.props.room;
    if (result.status === 'success') {
      let betResult = '';
      if (result.betResult === 1) {
        betResult = 'win';
        playSound('win');
        this.changeBgColor(result.betResult);
      } else if (result.betResult === 0) {
        betResult = 'draw';
        playSound('split');
        this.changeBgColor(result.betResult);
      } else {
        betResult = 'lose';
        playSound('lose');
        this.changeBgColor(result.betResult);
      }

      this.setState(prevState => ({
        box_list: prevState.box_list.map(el =>
          el._id === selected_id ? { ...el, status: 'opened' } : el
        ),
        isOpen: false,
        betResults: [
          ...prevState.betResults,
          { ...result, user: currentUser, room: currentRoom }
        ]
      }));

      this.setState(prevState => ({
        betResults: [
          ...prevState.betResults,
          { ...result, user: currentUser, room: currentRoom }
        ]
      }));

      this.props.refreshHistory();
    }
  };

  onBtnBetClick = async e => {
    const {
      creator_id,
      isAuthenticated,
      user_id,
      isDarkMode,
      is_private,
      openGamePasswordModal,
      roomInfo,
      balance,
      refreshHistory
    } = this.props;
    const { bet_amount } = this.state;

    if (e) {
      e.preventDefault();
    }
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
      const result = await confirmModalCreate(
        isDarkMode,
        'ARE YOU SURE YOU WANT TO PLACE THIS BET?',
        'Yes',
        'Cancel',
        async () => {
          // This should be a function
          if (is_private === true) {
            openGamePasswordModal();
          } else {
            await this.joinGame();
          }
          refreshHistory();
        }
      );
    }
  };

  joinGame = async () => {
    const {
      bet_amount,
      betting,
      box_list,
      selected_id,
      is_anonymous
    } = this.state;
    const { playSound, refreshHistory } = this.props;

    let stored_bet_array = JSON.parse(localStorage.getItem('bet_array')) || [];
    while (stored_bet_array.length >= 20) {
      stored_bet_array.shift();
    }

    stored_bet_array.push({ bet: bet_amount });
    localStorage.setItem('bet_array', JSON.stringify(stored_bet_array));

    const result = await this.props.join({
      bet_amount: parseFloat(bet_amount),
      selected_id: selected_id,
      is_anonymous: is_anonymous
      // slippage: this.state.slippage
    });

    const currentUser = this.props.user;
    const currentRoom = this.props.room;
    if (result.status === 'success') {
      let betResult = '';
      if (result.betResult === 1) {
        betResult = 'win';
        playSound('win');
        this.changeBgColor(result.betResult);
      } else if (result.betResult === 0) {
        betResult = 'draw';
        playSound('split');
        this.changeBgColor(result.betResult);
      } else {
        betResult = 'lose';
        playSound('lose');
        this.changeBgColor(result.betResult);
      }

      // this.props.updateBetResult(betResult);
      this.setState(prevState => ({
        box_list: prevState.box_list.map(el =>
          el._id === selected_id ? { ...el, status: 'opened' } : el
        ),
        isOpen: true,
        betResults: [
          ...prevState.betResults,
          { ...result, user: currentUser, room: currentRoom }
        ]
      }));

      setTimeout(() => {
        this.setState({ isOpen: false });
      }, 1500);
      this.setState(
        prevState => ({
          betResults: [
            ...prevState.betResults,
            { ...result, user: currentUser, room: currentRoom }
          ]
        }),
        () => {
          refreshHistory();
        }
      );
    }
  };

  onBtnGoToMainGamesClicked = e => {
    e.preventDefault();
    history.push('/');
  };

  getBetForm = () => {
    let prizes = [];
    let prices = [];
    let openedBoxes = 0;
    let prizeSum = 0;
  let priceSum = 0;
  let priceCount = 0;
    let pr = 0;
    let numPrizesGreaterThanPrices = 0; // Initialize counter

    this.state.box_list.map(row => {
      prizes.push({
        prize: row.box_prize,
        status: row.status
      });
      prices.push({
        price: row.box_price,
        status: row.status
      })
      pr = pr < row.box_prize ? row.box_prize : pr;

      if (row.status === "init") {
        prizeSum += row.box_prize;
        priceSum += row.box_price;
        priceCount++;
         // Check if the prize is greater than the price
      if (row.box_prize > row.box_price) {
        numPrizesGreaterThanPrices++;
      }
      } else {
        openedBoxes += row.box_price;
      }
      return true;
    });
    prizes.sort((a, b) => a.prize - b.prize);

    let averagePrice = priceCount > 0 ? priceSum / priceCount : 0;
    let guesses = ((this.props.roomInfo.endgame_amount - prizeSum) - openedBoxes)/ averagePrice;
    let attempts = guesses < 1 ? 1 : guesses;
    // console.log("prizes.length", prizes.length);
    // console.log("guesses", guesses);
    // console.log("numPrizesGreaterThanPrices", numPrizesGreaterThanPrices);
    const styles = ['copy-btn'];
    let text = 'COPY CONTRACT';

    if (this.state.clicked) {
      styles.push('clicked');
      text = 'COPIED!';
    }

    return (
      <div className="game-page">
        <div className="page-title">
          <h2>PLAY - Mystery Box</h2>
        </div>
        <div className="game-contents">
          <div
            className="pre-summary-panel"
            ref={this.panelRef}
            // onScroll={this.handleScroll}
          >
            <div className="pre-summary-panel__inner mystery-box">
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
                      <div className="label your-max-return">Your Return</div>
                    </div>
                    <div className="value">
                      {convertToCurrency(updateDigitToPoint2(pr))}
                    </div>
                  </div>
                  <div className="data-item">
                    <div>
                      <div className="label win-chance">Win Chance</div>
                    </div>
                    <div className="value">
  {((this.calculateProbability(prizes.length, guesses, numPrizesGreaterThanPrices) || numPrizesGreaterThanPrices / prizes.length) * 100).toFixed(2)}%
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
          <div className="game-info-panel"             style={{ position: 'relative', zIndex: 10 }}
>
<div className='mountains-bg'>

<Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: mountainsBg
              }}
              style={{
                width: '100vw',
                zIndex: '-1',
                filter: 'brightness(0.72)'
              }}
              />
              </div>
              <div className='mountains-bg-last'>

<Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: mountainsBg
              }}
              style={{
                width: '100vw',
                zIndex: '-1',
                filter: 'brightness(0.72)'
              }}
              />
              </div>
            <h3 className="game-sub-title">Prizes</h3>
            <p className="box-prizes">
  {prizes.reduce((accumulator, item) => {
    const existingItem = accumulator.find((element) => element.prize === item.prize);
    if (existingItem) {
      existingItem.count += 1;
    } else {
      accumulator.push({ prize: item.prize, count: 1 });
    }
    return accumulator;
  }, []).sort((a, b) => {
    return b.prize - a.prize;
  }).map((item, key) => (
    <span className={item.prize === 0 ? 'EMPTY' : ''} key={key}>
      {convertToCurrency(item.prize === 0 ? 'EMPTY' : item.prize)}
      {' '}
      ({(item.count / prizes.length * 100).toFixed(2)}%)
    </span>
  ))}
</p>

            <h3 className="game-sub-title">{attempts.toFixed(2)} guesses remaining</h3>
            <div className="boxes-panel boxes-join">
              {this.state.box_list.map((row, index) => (
                <Card
                  variant="outlined"
                  className={
                    'box box-' +
                    row.status +
                    (this.state.selected_id &&
                    row._id === this.state.selected_id
                      ? ' active'
                      : '') +
                    (row._id === this.state.selected_id &&
                    this.state.bgColorChanged &&
                    this.state.betResult === -1
                      ? ' draw-bg'
                      : '') +
                    (row._id === this.state.selected_id &&
                    this.state.betResult === 0
                      ? ' lose-bg'
                      : '') +
                    (row._id === this.state.selected_id &&
                    this.state.betResult === 1
                      ? ' win-bg'
                      : '')
                  }
                  status={row.status}
                  _id={row._id}
                  box_price={row.box_price}
                  index={index}
                  key={row._id}
                  onClick={this.onBoxClicked}
                >
                  <CardContent>
                    <Typography color="textSecondary">
                      {convertToCurrency(row.box_price)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
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
          <BetArray arrayName="bet_array" label="bet" />

          <div className="action-panel">
            <Share roomInfo={this.props.roomInfo} />
          </div>
        </div>
      </div>
    );
  };

  onBtnPlayAgainClicked = e => {
    e.preventDefault();
    if (this.props.roomStatus === 'finished') {
      alertModal(this.props.isDarkMode, 'THIS STAKE HAS ENDED');
      history.go('/');
    } else {
      this.setState({ isOpen: false });
    }
  };

   calculateProbability = (numBoxes, numGuesses, numPrizes) => {
      // Calculate probability of not winning
      let probabilityNotWinning = 1;
      for (let i = 0; i < numGuesses; i++) {
        probabilityNotWinning *= (numBoxes - numPrizes - i) / (numBoxes - i);
      }
  
      // Calculate probability of winning
      let probabilityWinning = 1 - probabilityNotWinning;
  
      return probabilityWinning;
    };

  getBetResultForm = () => {
    // let prizes = [];
    // this.state.box_list.map(row => {
    //   prizes.push({
    //     prize: row.box_prize,
    //     status: row.status
    //   });
    //   return true;
    // });
    // prizes.sort((a, b) => a.prize - b.prize);
    let timeLeft = 1500; // duration of modal in milliseconds
    const intervalId = setInterval(() => {
      timeLeft -= 100;
      if (timeLeft === 0) {
        clearInterval(intervalId);
      }
    }, 100);
    
    return (
      <div className="game-page">
        <div className="game-contents mystery-box-result-contents">
          <div className="game-info-panel">
            <div
              className={`mystery-box-result ${
                this.state.betResult === 0 ? 'failed' : 'success'
              }`}
            >
              {convertToCurrency(this.state.betResult)}
            </div>
            <h4 className="game-sub-title" style={{marginTop: "30px"}}>
              {this.state.betResult === 0
                ? `PAHAH WRONG BOX DICKHEAD!`
                : `NICE 😎 ISSA MONEY BOX`}
            </h4>
            {/* <p>
              {this.state.betResult === 0 ? `THIS BOX IS EMPTY` : `YOU WON!`}
            </p> */}
          </div>
          <div className="countdown-timer">
            <div
              className="countdown-bar"
              style={{ width: `${(timeLeft / 1500) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.getBetForm()}
        {this.state.betResult !== -1 && this.state.isOpen && (
          <ReactModal
            isOpen={this.state.isOpen}
            contentLabel="Prizes"
            closeModal={this.onBtnPlayAgainClicked}
            style={customStyles}
          >
            <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
              <div className="modal-header">
                <h2>PRIZE</h2>
                <Button
                  className="btn-close"
                  onClick={this.onBtnPlayAgainClicked}
                >
                  ×
                </Button>
              </div>
              <div className="modal-body edit-modal-body">
                {this.getBetResultForm()}
              </div>
            </div>
          </ReactModal>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  socket: state.auth.socket,
  isAuthenticated: state.auth.isAuthenticated,
  balance: state.auth.balance,
  betResult: state.logic.betResult,
  roomStatus: state.logic.roomStatus,
  isPasswordCorrect: state.snackbar.isPasswordCorrect,
  isDarkMode: state.auth.isDarkMode,
  creator: state.logic.curRoomInfo.creator_name
});

const mapDispatchToProps = {
  openGamePasswordModal
  // updateBetResult: (betResult) => dispatch(updateBetResult(betResult))
};

export default connect(mapStateToProps, mapDispatchToProps)(MysteryBox);
