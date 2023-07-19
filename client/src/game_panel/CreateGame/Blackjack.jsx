import React, { Component } from 'react';
import DefaultBetAmountPanel from './DefaultBetAmountPanel';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';

import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { alertModal } from '../modal/ConfirmAlerts';

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

  // Calculate the base win chances
  const baseWinChance = (100 / 3).toFixed(2);

  const rockWinChance = parseFloat(baseWinChance);
  const paperWinChance = parseFloat(baseWinChance);
  const scissorsWinChance = parseFloat(baseWinChance);

  // Calculate the range of frequencies
  const freq = { rock, paper, scissors };
  const freqValues = Object.values(freq);
  const range = Math.max(...freqValues) - Math.min(...freqValues);

  // Adjust probabilities based on the range of frequencies
  const sensitivityFactor = (range / 100) * total; // You can adjust this value to increase or decrease sensitivity
  const adjustmentFactor = (range / total) * sensitivityFactor;

  const adjustedRockWinChance = (
    rockWinChance +
    rock * adjustmentFactor
  ).toFixed(2);
  const adjustedPaperWinChance = (
    paperWinChance +
    paper * adjustmentFactor
  ).toFixed(2);
  const adjustedScissorsWinChance = (
    scissorsWinChance +
    scissors * adjustmentFactor
  ).toFixed(2);

  const lowest = Math.min(
    adjustedRockWinChance,
    adjustedPaperWinChance,
    adjustedScissorsWinChance
  );
  const highest = Math.max(
    adjustedRockWinChance,
    adjustedPaperWinChance,
    adjustedScissorsWinChance
  );

  return `${lowest.toFixed(2)}% - ${highest.toFixed(2)}%`;
};

const calcEV = (calcWinChance, wager, winPayout, lossPayout, tiePayout) => {
  const winChance = calcWinChance;
  const lowest = winChance.split(' - ')[0].replace('%', '');
  const highest = winChance.split(' - ')[1].replace('%', '');
  const winProb = highest / 100;
  const loseProb = lowest / 100;
  const tieProb = 1 - winProb - loseProb;

  const EV =
    -1 *
    (winProb * winPayout + loseProb * lossPayout + tieProb * tiePayout - wager);
  return EV.toFixed(2);
};
const predictNext = (bj_list, score) => {
  // Count the occurrences of each state transition
  const transitions = {
    stand: { stand: 0, hit: 0 },
    hit: { stand: 0, hit: 0 }
  };

  // Iterate over bj_list to count state transitions
  for (let i = 0; i < bj_list.length - 1; i++) {
    const currentState = bj_list[i].bj;
    const nextState = bj_list[i + 1].bj;
    transitions[currentState][nextState]++;
  }

  // Calculate transition probabilities
  const transitionProbabilities = {
    stand: {
      stand: transitions.stand.stand / (transitions.stand.stand + transitions.stand.hit),
      hit: transitions.stand.hit / (transitions.stand.stand + transitions.stand.hit)
    },
    hit: {
      stand: transitions.hit.stand / (transitions.hit.stand + transitions.hit.hit),
      hit: transitions.hit.hit / (transitions.hit.stand + transitions.hit.hit)
    }
  };

  // Calculate the average scores for "stand" and "hit" actions
  let standCount = 0;
  let standScoreSum = 0;
  let hitCount = 0;
  let hitScoreSum = 0;

  for (let i = 0; i < bj_list.length; i++) {
    if (bj_list[i].bj === 'stand') {
      standCount++;
      standScoreSum += bj_list[i].score;
    } else if (bj_list[i].bj === 'hit') {
      hitCount++;
      hitScoreSum += bj_list[i].score;
    }
  }

  const averageStandScore = standCount > 0 ? standScoreSum / standCount : 0;
  const averageHitScore = hitCount > 0 ? hitScoreSum / hitCount : 0;

  // Predict the next state based on the score, average scores, and transition probabilities
  const probabilityOfStand = transitionProbabilities.hit.stand;
  const probabilityOfHit = transitionProbabilities.stand.hit;

  const threshold = Math.random();

  if (score < averageStandScore * probabilityOfStand + averageHitScore * probabilityOfHit) {
    return 'hit';
  } else if (score > averageStandScore * (1 - probabilityOfStand) + averageHitScore * (1 - probabilityOfHit)) {
    return 'stand';
  } else if (threshold < probabilityOfHit) {
    return 'hit';
  } else {
    return 'stand';
  }
};


class Blackjack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected_bj: '',
      bet_amount: 5.0,
      winChance: 33,
      bj_list: [],
      cards: [],
      scoreAnimation: false,
      score: 0,
      transitionMatrix: {
        R: { R: 0, P: 0, S: 0 },
        P: { R: 0, P: 0, S: 0 },
        S: { R: 0, P: 0, S: 0 }
      }
    };
    this.onChangeBetAmount = this.onChangeBetAmount.bind(this);
  }


  startGame = () => {
    const cards = this.drawCards(2);
    const score = this.calculateScore(cards);
  
    setTimeout(() => {
      this.props.playSound('cards');
    }, 500);
  
    this.setState({ cards, score }, () => {
      // Trigger the animation after the state is updated
      const drawnCards = document.querySelectorAll('.card');
      drawnCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`; // Delay the animation for each card
        card.classList.add('card-hidden'); // Apply the .card-hidden class to all card elements
      });
  
      if (score === 21) {
        setTimeout(() => {
          // Remove the .card-hidden class to revert back to the original state
          drawnCards.forEach((card) => {
            card.classList.remove('card-hidden');
          });
  
          setTimeout(() => {
            this.setState({ cards: [], score: 0 }, () => {
              // Trigger the animation after the state is updated
              this.startGame();
            });
          }, 1000);
        }, 300);
      } else {
        setTimeout(() => {
          // Remove the .card-hidden class to revert back to the original state
          drawnCards.forEach((card) => {
            card.classList.remove('card-hidden');
          });
        }, 300);
      }
    });
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
    this.props.playSound('cards');

    return { card, suit };
  };

  drawCards = count => {
    const cards = [];
    for (let i = 0; i < count; i++) {
      const card = this.drawCard();
      cards.push(card);
    }

    return cards;
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

  hit = () => {
    const newCard = this.drawCard();
    const newCards = [...this.state.cards, newCard];
    const newScore = this.calculateScore(newCards);
    if (newScore >= 21) {
      this.setState({ cards: [], score: 0 }, () => {
        // Trigger the animation after the state is updated
        this.startGame();
      });
    } else {
      this.setState({ cards: newCards, score: newScore }, () => {
        // Trigger the animation for the newly drawn card
        const drawnCards = document.querySelectorAll('.card');
        const newCardElement = drawnCards[drawnCards.length - 1]; // Get the last card element

        // Add the .card-hidden class to hide the suit and number and change background color to red
        newCardElement.classList.add('card-hidden');

        newCardElement.style.animationDelay = `${(drawnCards.length - 1) *
          0.2}s`; // Delay the animation
        newCardElement.style.animation =
          'cardAnimation 0.5s ease-in-out forwards';

        setTimeout(() => {
          // Remove the .card-hidden class to revert back to the original state
          newCardElement.classList.remove('card-hidden');
        }, 300);
      });
    }
  };

  stand = () => {
    this.onAddRun(this.state.score, 'stand');
    this.setState({ cards: [], score: 0 }, () => {
      // Trigger the animation after the state is updated
      this.startGame();
    });
  };
  onAutoPlay = () => {
    if (this.props.bj_list.length > 2) {
      const prevStates = this.props.bj_list;
  
      const nextBj = predictNext(this.props.bj_list, this.state.score);
      
      if (this.state.score !== 21) {
        this.onAddRun(this.state.score, nextBj);
      }
      
      this.setState({ cards: [], score: 0 }, () => {
        // Trigger the animation after the state is updated
        this.startGame();
      });
    } else {
      alertModal(
        this.props.isDarkMode,
        'MINIMUM 3 RUNS, TO MAKE A PREDICTION!!!'
      );
      return;
    }
  };
  

  onChangeWinChance = winChance => {
    this.setState({ winChance });
  };

  onRemoveItem = index => {
    this.props.playSound('tap');

    const wager = 1;
    const winPayout = 2;
    const lossPayout = 0;
    const tiePayout = 1;
    const newArray = this.props.bj_list.filter((elem, i) => i != index);
    const winChance = calcWinChance(newArray);
    const winChanceEV = calcEV(
      winChance,
      wager,
      winPayout,
      lossPayout,
      tiePayout
    );

    this.props.onChangeState({
      bj_list: newArray,
      winChance: winChanceEV
    });
  };

  onAddRun = (score, selected_bj) => {
    this.props.playSound('boop');
    this.setState({ selected_bj: selected_bj });
    const newArray = JSON.parse(JSON.stringify(this.props.bj_list));
    newArray.push({
      score: score,
      bj: selected_bj
    });
    // const winChance = calcWinChance(newArray);
    // const winChanceEV = calcEV(
    //   winChance,
    //   wager,
    //   winPayout,
    //   lossPayout,
    //   tiePayout
    // );
    this.props.onChangeState({
      bj_list: newArray
      // winChance: winChanceEV
    });
    console.log(this.props.bj_list);
    // this.onChangeWinChance(winChance);
    // this.setState({ winChance: winChanceEV });
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.child_step !== prevProps.child_step) {
      setTimeout(() => {
        this.startGame();
      }, 500);
    }
    if (prevState.bj_list.length !== this.props.bj_list.length) {
      const table = document.getElementById('runs');
      if (table) {
        table.scrollTop = table.scrollHeight;
      }
    }
  }

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

  onChangeBetAmount = new_state => {
    this.setState({ bet_amount: new_state.selected_bet_amount });
  };
  render() {
    const defaultBetAmounts = [10, 25, 50, 100, 250];
    const { score, cards, scoreAnimation } = this.state;

    return this.props.step === 1 ? (
      <div className="game-info-panel">
        <h1> DEMO ONLY, GAME UNDER DEVELOPMENT 🚧</h1>

        <DefaultBetAmountPanel
          bet_amount={this.props.bet_amount}
          onChangeState={this.props.onChangeState}
          game_type="BJ"
          defaultBetAmounts={defaultBetAmounts}
        />
      </div>
    ) : (
      <div className="game-info-panel">
        <div className="qs-add-run-panel">
          <div className="bj-add-run-form">
            <div className="deck">
              <div className="card-back">
                <div className="rps-logo">
                  <img src={'/img/rps-logo-white.svg'} alt="RPS Game Logo" />
                </div>
              </div>
            </div>
            <div className="card-container">
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
            <div id="bj-radio">
              <Button
                className={
                  'hit' + (this.state.selected_bj === 'hit' ? ' active' : '')
                }
                variant="contained"
                onClick={() => {
                  this.onAddRun(this.state.score, 'hit');
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
            </div>
            <Button id="aiplay" variant="contained" onClick={this.onAutoPlay}>
              Test AI Play
            </Button>
          </div>
          <div className="bj-add-run-table">
            <h3 className="game-sub-title">Train the Dealer!</h3>
            <table id="runs">
              <tbody>
                {this.props.bj_list && this.props.bj_list.length > 0 ? (
                  this.props.bj_list.map((bj, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{bj.score}</td>
                      <td>{bj.bj}</td>
                      <td>
                        <HighlightOffIcon
                          onClick={() => this.onRemoveItem(index)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td id="add-run" colSpan="4">
                      Provide the AI with example outputs
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth.isAuthenticated,
  isDarkMode: state.auth.isDarkMode
});

export default connect(mapStateToProps)(Blackjack);
