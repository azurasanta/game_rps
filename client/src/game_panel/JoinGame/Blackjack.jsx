import React, { Component } from 'react';
import { connect } from 'react-redux';
import BetArray from '../../components/BetArray';
import Share from '../../components/Share';
import { openGamePasswordModal } from '../../redux/Notification/notification.actions';
import { updateDigitToPoint2 } from '../../util/helper';
import Lottie from 'react-lottie';
import bjBg from '../LottieAnimations/bjBg.json';
import { YouTubeVideo } from '../../components/YoutubeVideo';
import BetAmountInput from '../../components/BetAmountInput';
import { Button, TextField } from '@material-ui/core';
import { deductBalanceWhenStartBlackjack } from '../../redux/Logic/logic.actions';

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
    if (el.bj === 'R') {
      rock++;
    } else if (el.bj === 'P') {
      paper++;
    } else if (el.bj === 'S') {
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

const predictNext = bj_list => {
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
  for (let i = 0; i < bj_list.length - 3; i++) {
    transitionMatrix[bj_list[i].bj][bj_list[i + 1].bj][bj_list[i + 2].bj][
      bj_list[i + 3].bj
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
  const winChance = calcWinChance(bj_list);
  let deviation = 0;
  if (winChance !== '33.33%') {
    deviation = (1 - 1 / 3) / 2;
  }
  // Use the transition matrix to predict the next state based on the current state
  let currentState1 = bj_list[bj_list.length - 3].bj;
  let currentState2 = bj_list[bj_list.length - 2].bj;
  let currentState3 = bj_list[bj_list.length - 1].bj;
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

class Blackjack extends Component {
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
      disabledButtons: true,
      bgColorChanged: false,
      selected_bj: '',
      cardVisibility: false,
      is_started: false,
      advanced_status: '',
      is_anonymous: false,
      bet_amount: 1,
      cards: [],
      cards_host: [],
      score: 0,
      score_host: 0,
      bankroll: parseFloat(this.props.bet_amount) - this.getPreviousBets(),
      // bankroll: 0,
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

  componentDidMount = () => {
    this.resetGame();
    // Initialize items array
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

  // Obfuscated code example
  dealCards = (drawCardsFunc, calculateScoreFunc, cardsType, scoreType) => {
    const cards = drawCardsFunc(2);
    const score = calculateScoreFunc(cards);

    const cardVisibility = cards.map((_, index) =>
      index !== 1 ? true : false
    );

    this.setState(
      { [cardsType]: cards, [scoreType]: score, cardVisibility },
      () => {
        const drawnCards = document.querySelectorAll(
          `.${cardsType === 'cards' ? 'card' : 'card_host'}`
        );

        drawnCards.forEach((card, index) => {
          card.style.animationDelay = `${index * 0.2}s`;
          const cardNumber = card.querySelector('.card-number');
          const cardSuit = card.querySelector('.card-suit');

          if (!this.state.cardVisibility[index]) {
            card.classList.add('card-hidden');
            cardNumber.classList.add('card-hidden');
            cardSuit.classList.add('card-hidden');
          }
        });

        setTimeout(() => {
          drawnCards.forEach((card, index) => {
            if (index >= 2 && !this.state.cardVisibility[index]) {
              card.classList.remove('card-hidden');
              const cardNumber = card.querySelector('.card-number');
              const cardSuit = card.querySelector('.card-suit');
              cardNumber.classList.remove('card-hidden');
              cardSuit.classList.remove('card-hidden');
            }
          });
        }, 300);
      }
    );
  };

  dealJoiner = () => {
    this.dealCards(this.drawCards, this.calculateScore, 'cards', 'score');
  };

  dealHost = () => {
    this.dealCards(
      this.drawCardsHost,
      this.calculateScoreHost,
      'cards_host',
      'score_host'
    );
  };

  drawCard = () => {
    const suits = ['♠', '♣', '♥', '♦'];
    const deck = [
      'A',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'J',
      'Q',
      'K'
    ];

    const randomSuitIndex = Math.floor(Math.random() * suits.length);
    const randomCardIndex = Math.floor(Math.random() * deck.length);

    const suit = suits[randomSuitIndex];
    const card = deck[randomCardIndex];

    return { card, suit };
  };

  drawCards = count => {
    const cards = [];
    for (let i = 0; i < count; i++) {
      const card = this.drawCard();
      cards.push(card);
    }
    this.props.playSound('cards');

    return cards;
  };

  drawCardHost = () => {
    const suits = ['♠', '♣', '♥', '♦'];
    const deck = [
      'A',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'J',
      'Q',
      'K'
    ];

    const randomSuitIndex = Math.floor(Math.random() * suits.length);
    const randomCardIndex = Math.floor(Math.random() * deck.length);

    const suit = suits[randomSuitIndex];
    const card_host = deck[randomCardIndex];

    return { card_host, suit };
  };

  drawCardsHost = count => {
    const cards_host = [];
    for (let i = 0; i < count; i++) {
      const card_host = this.drawCardHost();
      cards_host.push(card_host);
    }
    return cards_host;
  };

  // Update the calculateScore function to trigger the animation
  calculateScore = cards => {
    let score = 0;
    let hasAce = false;

    cards.forEach(card => {
      if (card.card === 'A') {
        score += 11;
        hasAce = true;
      } else if (['K', 'Q', 'J'].includes(card.card)) {
        score += 10;
      } else {
        score += parseInt(card.card, 10);
      }
    });

    if (hasAce && score > 21) {
      score -= 10;
    }

    this.setState({ scoreAnimation: true }, () => {
      setTimeout(() => {
        this.setState({ scoreAnimation: false });
      }, 500); // Adjust the duration of the animation as needed
    });

    return score;
  };

  // Update the calculateScore function to trigger the animation
  calculateScoreHost = cards_host => {
    const firstCard = cards_host[0]; // Get the first card

    let score = 0;
    let hasAce = false;

    if (firstCard.card_host === 'A') {
      score += 11;
      hasAce = true;
    } else if (['K', 'Q', 'J'].includes(firstCard.card_host)) {
      score += 10;
    } else {
      score += parseInt(firstCard.card_host, 10);
    }

    if (hasAce && score > 21) {
      score -= 10;
    }

    // Update the animation code to trigger animation for the first card only
    if (firstCard) {
      this.setState({ scoreAnimation: true }, () => {
        setTimeout(() => {
          this.setState({ scoreAnimation: false });
        }, 500); // Adjust the duration of the animation as needed
      });
    }

    return score;
  };

  hit = () => {
    const newCard = this.drawCard();
    const newCards = [...this.state.cards, newCard];
    const newScore = this.calculateScore(newCards);

    if (newScore >= 21) {
      this.setState({ cards: [], score: 0 }, () => {
        // Trigger the animation after the state is updated
        this.dealJoiner();
      });
    } else {
      this.setState({ cards: newCards, score: newScore }, () => {
        // Trigger the animation for the newly drawn card
        const drawnCards = document.querySelectorAll('.card');
        const newCardElement = drawnCards[drawnCards.length - 1]; // Get the last card element
        newCardElement.style.animationDelay = `${(drawnCards.length - 1) *
          0.2}s`; // Delay the animation
        newCardElement.style.animation =
          'cardAnimation 0.5s ease-in-out forwards';
      });
    }
  };

  stand = () => {
    // this.onAddRun(this.state.score, 'stand');
    this.setState({ cards: [], score: 0 }, () => {
      this.dealJoiner();
    });
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
    const { isPasswordCorrect, selected_bj } = this.state;

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
      this.joinGame(selected_bj);
    }
  }

  // handleScroll = event => {
  //   const panel = event.target;
  //   const scrollLeft = panel.scrollLeft;
  //   const maxScrollLeft = panel.scrollWidth - panel.clientWidth;

  //   if (scrollLeft >= maxScrollLeft) {
  //     const items = this.state.items.concat(this.state.items);
  //     this.setState({ items }, () => {
  //       panel.style.animation = 'none';
  //       panel.scrollTo({ left: 0, behavior: 'auto' });
  //       void panel.offsetWidth;
  //       panel.style.animation = 'ticker 20s linear infinite';
  //     });
  //   } else {
  //     panel.style.animation = 'none';
  //   }
  // };

  getSuitSymbol = card => {
    switch (card) {
      case '♥':
        return <span className="suit-hearts">&hearts;</span>;
      case '♦':
        return <span className="suit-diamonds">&diams;</span>;
      case '♠':
        return <span className="suit-spades">&spades;</span>;
      case '♣':
        return <span className="suit-clubs">&clubs;</span>;
      default:
        return '';
    }
  };

  joinGame = async () => {
    const {
      bj_bet_item_id,
      isDarkMode,
      refreshHistory,
      join,
      playSound
    } = this.props;

    const {
      selected_bj,
      is_anonymous,
      slippage,
      bet_amount,
      score,
      score_host
    } = this.state;

    const result = await join({
      bet_amount: parseFloat(bet_amount),
      selected_bj: selected_bj,
      score: score,
      score_host: score_host,
      is_anonymous: is_anonymous,
      bj_bet_item_id: bj_bet_item_id,
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

    let stored_bj_array = JSON.parse(localStorage.getItem('bj_array')) || [];
    while (stored_bj_array.length >= 20) {
      stored_bj_array.shift();
    }
    stored_bj_array = stored_bj_array.filter(item => item && item.bj);

    stored_bj_array.push({ bj: selected_bj });
    localStorage.setItem('bj_array', JSON.stringify(stored_bj_array));

    refreshHistory();
    this.resetGame();
  };

  resetGame = () => {
    this.setState({
      cards: [],
      cards_host: [],
      score: 0,
      score_host: 0,
      is_started: false,
      disabledButtons: true
    });
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
      roomInfo,
      deductBalanceWhenStartBlackjack
    } = this.props;
    const { bet_amount, bankroll, is_started } = this.state;

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
    this.setState({ disabledButtons: false });

    if (!is_started) {
      if (
        deductBalanceWhenStartBlackjack({
          bet_amount: bet_amount
        })
      ) {
        this.setState({
          is_started: true
        });
      }
      this.dealJoiner();
      this.dealHost();
    } else {
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
  }

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
  }

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

    const storageName = 'bj_array';
    if (!validateLocalStorageLength(storageName, isDarkMode)) {
      return;
    }
    const stored_bj_array = JSON.parse(localStorage.getItem(storageName)) || [];
    const intervalId = setInterval(() => {
      const randomItem = predictNext(stored_bj_array);
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
      bj_bet_item_id,
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
      selected_bj,
      betting
    } = this.state;

    // Check if betting is true before continuing
    if (!betting) {
      return;
    }

    this.setState({ selected_bj: randomItem });

    if (!validateBetAmount(bet_amount, balance, isDarkMode)) {
      return;
    }
    if (!validateBankroll(bet_amount, bankroll, isDarkMode)) {
      return;
    }

    const result = await this.props.join({
      bet_amount: parseFloat(bet_amount),
      selected_bj: selected_bj,
      is_anonymous: is_anonymous,
      bj_bet_item_id: bj_bet_item_id,
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
    const {
      score,
      cards,
      cards_host,
      score_host,
      scoreAnimation,
      cardVisibility
    } = this.state;

    return (
      <div className="game-page">
        <div className="page-title">
          <h1> DEMO ONLY, GAME UNDER DEVELOPMENT 🚧</h1>
          <h2>PLAY - Blackjack</h2>
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
            <div className="bjBg">
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: bjBg
                }}
                style={{
                  transform: 'rotate(180deg)',
                  filter: 'grayscale(1)',
                  opacity: '0.1'
                }}
              />
            </div>
            <div className="deck">
              <div className="card-back">
                <div className="rps-logo">
                  <img src={'/img/rps-logo-white.svg'} alt="RPS Game Logo" />
                </div>
              </div>
            </div>
            <div className="card-container">
              {cards_host.map((card_host, index) => (
                <div
                  key={index}
                  className={`card suit-${card_host.suit.toLowerCase()} ${
                    !cardVisibility[index] ? 'card-hidden' : ''
                  }`}
                >
                  <div
                    className={`card-suit ${
                      !cardVisibility[index] ? 'card-hidden' : ''
                    }`}
                  >
                    {this.getSuitSymbol(card_host.suit)}
                  </div>
                  <div
                    className={`card-number ${
                      !cardVisibility[index] ? 'card-hidden' : ''
                    }`}
                  >
                    {card_host.card_host}
                  </div>
                </div>
              ))}
            </div>

            <h6
              id="upper-score"
              className={scoreAnimation ? 'score animated' : 'score'}
            >
              {score_host}
            </h6>
            <div className="bow">
              <h3 className="game-sub-title">pays 3 to 2</h3>
              <img src={'/img/bow.svg'} alt="Blackjack pays 3 to 2" />
            </div>
            <div style={{ marginTop: '-30px' }} className="card-container">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className={`card suit-${card.suit.toLowerCase()}`}
                >
                  <div className="card-suit">
                    {this.getSuitSymbol(card.suit)}
                  </div>
                  <div className="card-number">{card.card}</div>
                </div>
              ))}
            </div>
            <h6 className={scoreAnimation ? 'score animated' : 'score'}>
              {score}
            </h6>
            <BetAmountInput
          betAmount={this.state.bet_amount}
          handle2xButtonClick={this.handle2xButtonClick}
          handleHalfXButtonClick={this.handleHalfXButtonClick}
          handleMaxButtonClick={this.handleMaxButtonClick}
          onChange={this.handleChange}
          isDarkMode={this.props.isDarkMode}
        />
            <div>
              <div id="bj-radio" style={{ zIndex: 1 }}>
                <Button
                  className={
                    'hit' + (this.state.selected_bj === 'hit' ? ' active' : '')
                  }
                  variant="contained"
                  disabled={this.state.disabledButtons}
                  style={{ opacity: this.state.disabledButtons ? 0.5 : 1 }}
                  onClick={() => {
                    this.hit();
                    const currentActive = document.querySelector('.active');
                    if (currentActive) {
                      currentActive.style.animation = 'none';
                      void currentActive.offsetWidth;
                      currentActive.style.animation = 'pulse 0.2s ease-in-out ';
                    }
                  }}
                >
                  HIT!
                </Button>
                <Button
                  className={
                    'stand' +
                    (this.state.selected_bj === 'stand' ? ' active' : '')
                  }
                  variant="contained"
                  disabled={this.state.disabledButtons}
                  style={{ opacity: this.state.disabledButtons ? 0.5 : 1 }}
                  onClick={() => {
                    this.stand();
                    const currentActive = document.querySelector('.active');
                    if (currentActive) {
                      currentActive.style.animation = 'none';
                      void currentActive.offsetWidth;
                      currentActive.style.animation = 'pulse 0.2s ease-in-out ';
                    }
                  }}
                >
                  STAND
                </Button>

                <Button
                  className={
                    'hit' + (this.state.selected_bj === 'hit' ? ' active' : '')
                  }
                  variant="contained"
                  disabled={this.state.disabledButtons}
                  style={{ opacity: this.state.disabledButtons ? 0.5 : 1 }}
                  onClick={() => {
                    this.hit();
                    const currentActive = document.querySelector('.active');
                    if (currentActive) {
                      currentActive.style.animation = 'none';
                      void currentActive.offsetWidth;
                      currentActive.style.animation = 'pulse 0.2s ease-in-out ';
                    }
                  }}
                >
                  SPLIT
                </Button>
                <Button
                  className={
                    'stand' +
                    (this.state.selected_bj === 'stand' ? ' active' : '')
                  }
                  variant="contained"
                  disabled={this.state.disabledButtons}
                  style={{ opacity: this.state.disabledButtons ? 0.5 : 1 }}
                  onClick={() => {
                    this.stand();
                    const currentActive = document.querySelector('.active');
                    if (currentActive) {
                      currentActive.style.animation = 'none';
                      void currentActive.offsetWidth;
                      currentActive.style.animation = 'pulse 0.2s ease-in-out ';
                    }
                  }}
                >
                  DOUBLE
                </Button>
              </div>
              <Button
                className="place-bet btnBlackjack"
                color="primary"
                onClick={() => this.onBtnBetClick()}
                variant="contained"
              >
                BET
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
          <BetArray arrayName="bj_array" label="bj" />

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
  deductBalanceWhenStartBlackjack
  // updateBetResult: (betResult) => dispatch(updateBetResult(betResult))
};

export default connect(mapStateToProps, mapDispatchToProps)(Blackjack);
