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
    if (el.rps === 'R') {
      rock++;
    } else if (el.rps === 'P') {
      paper++;
    } else if (el.rps === 'S') {
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

  const adjustedRockWinChance = (rockWinChance + rock * adjustmentFactor).toFixed(2);
  const adjustedPaperWinChance = (paperWinChance + paper * adjustmentFactor).toFixed(2);
  const adjustedScissorsWinChance = (scissorsWinChance + scissors * adjustmentFactor).toFixed(2);

  const lowest = Math.min(adjustedRockWinChance, adjustedPaperWinChance, adjustedScissorsWinChance);
  const highest = Math.max(adjustedRockWinChance, adjustedPaperWinChance, adjustedScissorsWinChance);

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
    this.state = {
      selected_rps: '',
      bet_amount: 10.00,
      winChance: 33,
      rps_list: [],
      transitionMatrix: {
        R: { R: 0, P: 0, S: 0 },
        P: { R: 0, P: 0, S: 0 },
        S: { R: 0, P: 0, S: 0 }
      }
    };
    this.onChangeBetAmount = this.onChangeBetAmount.bind(this);
  }

  onAutoPlay = () => {
    if (this.props.rps_list.length > 2) {
      const prevStates = this.props.rps_list;

      const nextRPS = predictNext(prevStates, this.props.rps_list);
      this.onAddRun(nextRPS);
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
    const newArray = this.props.rps_list.filter((elem, i) => i != index);
    const winChance = calcWinChance(newArray);
    const winChanceEV = calcEV(
      winChance,
      wager,
      winPayout,
      lossPayout,
      tiePayout
    );

    this.props.onChangeState({
      rps_list: newArray,
      winChance: winChanceEV
    });
  };

  onAddRun = selected_rps => {
    this.props.playSound('boop');
    const wager = 1;
    const winPayout = 2;
    const lossPayout = 0;
    const tiePayout = 1;
    this.setState({ selected_rps: selected_rps });
    const newArray = JSON.parse(JSON.stringify(this.props.rps_list));
    newArray.push({
      rps: selected_rps
    });
    const winChance = calcWinChance(newArray);
    const winChanceEV = calcEV(
      winChance,
      wager,
      winPayout,
      lossPayout,
      tiePayout
    );
    this.props.onChangeState({
      rps_list: newArray,
      winChance: winChanceEV
    });
    this.onChangeWinChance(winChance);
    this.setState({ winChance: winChanceEV });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.rps_list.length !== this.props.rps_list.length) {
      const table = document.getElementById('runs');
      if (table) {
        table.scrollTop = table.scrollHeight;
      }
    }
  }

  // handleAutoplayChange = () => {
  //   this.setState(prevState => ({
  //     autoplay: !prevState.autoplay
  //   }));
  // };
  onChangeBetAmount = new_state => {
    this.setState({ bet_amount: new_state.selected_bet_amount });
  };
  render() {
    const defaultBetAmounts = [10, 25, 50, 100, 250];

    return this.props.step === 1 ? (
      <div className="game-info-panel">
        {/* <h3 className="game-sub-title">Bankroll</h3> */}
        <DefaultBetAmountPanel
          bet_amount={this.props.bet_amount}
          onChangeState={this.props.onChangeState}
          game_type="RPS"
          defaultBetAmounts={defaultBetAmounts}
        />
        {/* <div id="rps-game-type-radio">
        <span
          className={this.props.rps_game_type === 0 ? ' active' : ''}
          onClick={() => {
            this.props.onChangeState({ rps_game_type: 0 });
          }}
        >
          Fixed
        </span>
        <span 
          className={(this.props.rps_game_type === 1 ? 'disabled' : '')}
          onClick={() => {
            if(this.props.rps_game_type !== 1) {
              this.props.onChangeState({rps_game_type: 1});
            }
          }}>
          Freeplay
        </span>
      </div> */}
      </div>
    ) : (
      <div className="game-info-panel">
        <div className="rps-add-run-panel">
          <div className="rps-add-run-form">
            <h3 className="game-sub-title">
              Select: Rock - Paper - Scissors!{' '}
            </h3>
            <div id="rps-radio">
              <Button
                className={
                  'rock' + (this.state.selected_rps === 'R' ? ' active' : '')
                }
                variant="contained"
                onClick={() => {
                  this.onAddRun('R');
                  const currentActive = document.querySelector('.active');
                  if (currentActive) {
                    currentActive.style.animation = 'none';
                    void currentActive.offsetWidth;
                    currentActive.style.animation = 'pulse 0.2s ease-in-out ';
                  }
                }}
              ></Button>
              <Button
                className={
                  'paper' + (this.state.selected_rps === 'P' ? ' active' : '')
                }
                variant="contained"
                onClick={() => {
                  this.onAddRun('P');
                  const currentActive = document.querySelector('.active');
                  if (currentActive) {
                    currentActive.style.animation = 'none';
                    void currentActive.offsetWidth;
                    currentActive.style.animation = 'pulse 0.2s ease-in-out ';
                  }
                }}
              ></Button>
              <Button
                className={
                  'scissors' +
                  (this.state.selected_rps === 'S' ? ' active' : '')
                }
                variant="contained"
                onClick={() => {
                  this.onAddRun('S');
                  const currentActive = document.querySelector('.active');
                  if (currentActive) {
                    currentActive.style.animation = 'none';
                    void currentActive.offsetWidth;
                    currentActive.style.animation = 'pulse 0.2s ease-in-out ';
                  }
                }}
              ></Button>
            </div>
            <Button id="aiplay" variant="contained" onClick={this.onAutoPlay}>
              Test AI Play
            </Button>
          </div>
          <div className="rps-add-run-table">
            <h3 className="game-sub-title">Training Data</h3>
            <table id="runs">
              <tbody>
                {this.props.rps_list && this.props.rps_list.length > 0 ? (
                  this.props.rps_list.map((rps, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{rps.rps}</td>
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

export default connect(mapStateToProps)(RPS);
