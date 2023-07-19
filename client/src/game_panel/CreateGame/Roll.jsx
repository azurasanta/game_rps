import React, { Component } from 'react';
import DefaultBetAmountPanel from './DefaultBetAmountPanel';
import { connect } from 'react-redux';
import { Button, TextField } from '@material-ui/core';

import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import {
  alertModal
} from '../modal/ConfirmAlerts';


const calcWinChance = (prevStates) => {
  let total = prevStates.length;
  let counts = {};
  prevStates.forEach((state) => {
    if (counts[state.roll]) {
      counts[state.roll]++;
    } else {
      counts[state.roll] = 1;
    }
  });
  let lowest = Infinity;
  let highest = -Infinity;
  Object.keys(counts).forEach((key) => {
    const chance = (counts[key] / total) * 100;
    if (chance < lowest) {
      lowest = chance;
    }
    if (chance > highest) {
      highest = chance;
    }
  });
  if (lowest === highest) {
    return lowest.toFixed(2) + "%";
  }
  return lowest.toFixed(2) + "% - " + highest.toFixed(2) + "%";
};

const calcAveMultiplier = (list) => {
  let sum = 0;
  for (let i = 0; i < list.length; i++) {
    sum += parseFloat(list[i].roll);
  }
  const average = sum / list.length;
  return parseFloat(average.toFixed(2));
};



class Roll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected_roll: '',
      bet_amount: 10.00,
      roll: '',
      roll_list: [],
      face: '',
      balance: this.props.balance,
      winChance: 33,
      aveMultiplier: 0,
    };
  }

  static getDerivedStateFromProps(props, current_state) {
    if (
      current_state.balance !== props.balance
    ) {
      return {
        ...current_state,
        balance: props.balance
      };
    }
    return null;
  }

  onChangeWinChance = (winChance) => {
    this.setState({ winChance });
  };

  onChangeAveMultiplier = (aveMultiplier) => {
    this.setState({ aveMultiplier });
  };
  predictNext = (roll_list) => {
    const faces = ['R', 'P', 'S', 'W', 'B', 'Bu'];
    const sequence = roll_list.map(roll => roll.face); // New array to store sequence of faces
    const nextStates = {};
  
    // Determine the probability of each face occurring next based on the previous sequence of faces
    faces.forEach((face) => {
      const count = sequence.filter((f, i) => i > 0 && sequence[i-1] === face).length;
      nextStates[face] = count / Math.max(1, sequence.length - 1);
    });
  
    // Check if all probabilities are either 0 or 1
    const allProbabilitiesOneOrZero = Object.values(nextStates).every(probability => probability === 0 || probability === 1);
  
    // Use the original method of predicting if all probabilities are either 0 or 1
    if (allProbabilitiesOneOrZero) {
      const occurrences = {};
      roll_list.forEach((roll) => {
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
  
  onRemoveItem = index => {
    this.props.playSound('tap');

    const newArray = this.props.roll_list.filter((elem, i) => i != index);
    // const bet_amount = calcBetAmount(newArray);
    const winChance = calcWinChance(newArray);
    const aveMultiplier = calcAveMultiplier(newArray);
    this.props.onChangeState({
      roll_list: newArray,
      winChance: winChance,
      aveMultiplier: aveMultiplier
    });

  };
  onAutoPlay = () => {
    const { roll_list } = this.props;
  
    if (roll_list.length < 3) {
      alertModal(this.props.isDarkMode, 'MINIMUM 3 RUNS, TO MAKE A PREDICTION!!!');
      return;
    }
  // console.log(roll_list)
    const predictedState = this.predictNext(roll_list);
    this.onAddRun(predictedState.roll, predictedState.face);
  };
  

  onAddRun = (roll, face) => {
    // console.log(this.props.roll_list)
    this.props.playSound('boop');
  

    const newArray = JSON.parse(JSON.stringify(this.props.roll_list));

 
    newArray.push({
      roll: roll,
      face: face
    });

    const aveMultiplier = calcAveMultiplier(newArray);
    const winChance = calcWinChance(newArray);
    this.props.onChangeState({
      roll_list: newArray,
      winChance: winChance,
      aveMultiplier: aveMultiplier
    });
    this.onChangeWinChance(winChance);

    this.onChangeAveMultiplier(aveMultiplier);
    this.setState({ winChance, aveMultiplier });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.roll_list.length !== this.props.roll_list.length) {
      const table = document.getElementById('runs');
      if (table) {
        table.scrollTop = table.scrollHeight;
      }
    }
  }


  onChangeBetAmount = new_state => {
    this.setState({ roll: new_state.selected_bet_amount });
  };
  render() {
    
    const defaultBetAmounts = [10, 25, 50, 100, 250];

    return this.props.step === 1 ? (
      
      <div className="game-info-panel">
        {/* <h3 className="game-sub-title">Bankroll</h3> */}
        <DefaultBetAmountPanel
              bet_amount={this.props.bet_amount}
              onChangeState={this.props.onChangeState}
              game_type="roll"
              defaultBetAmounts={defaultBetAmounts}
            />
     
      </div>
    ) : (
      
      <div className="game-info-panel">
                          {/* <h1> DEMO ONLY, GAME UNDER DEVELOPMENT 🚧</h1> */}

        <div className="rps-add-run-panel">
        <div className="roll-add-run-form">
           
        <h3 className="game-sub-title">
  Add some rolls!
</h3>
<div id="roll">
  <Button
    className={
      'rock button-2x-r' + (this.state.selected_roll === 'R' ? ' active' : '')
    }
    variant="contained"
    onClick={() => {
      this.onAddRun('2', 'R');
      const currentActive = document.querySelector('.active');
      if (currentActive) {
        currentActive.style.animation = 'none';
        void currentActive.offsetWidth;
        currentActive.style.animation = 'pulse 0.2s ease-in-out ';
      }
    }}
  ><span>2x (4x)</span></Button>
  <Button
    className={
      'paper button-2x-p' + (this.state.selected_roll === 'P' ? ' active' : '')
    }
    variant="contained"
    onClick={() => {
      this.onAddRun('2', 'P');
      const currentActive = document.querySelector('.active');
      if (currentActive) {
        currentActive.style.animation = 'none';
        void currentActive.offsetWidth;
        currentActive.style.animation = 'pulse 0.2s ease-in-out ';
      }
    }}
  ><span>2x (4x)</span></Button>
  <Button
    className={
      'scissors button-2x-s' +
      (this.state.selected_roll === 'S' ? ' active' : '')
    }
    variant="contained"
    onClick={() => {
      this.onAddRun('2', 'S');
      const currentActive = document.querySelector('.active');
      if (currentActive) {
        currentActive.style.animation = 'none';
        void currentActive.offsetWidth;
        currentActive.style.animation = 'pulse 0.2s ease-in-out ';
      }
    }}
  ><span>2x (4x)</span></Button>
  <Button
    className={
      'whale button-14x' +
      (this.state.selected_roll === 'W' ? ' active' : '')
    }
    variant="contained"
    onClick={() => {
      this.onAddRun('14', 'W');
      const currentActive = document.querySelector('.active');
      if (currentActive) {
        currentActive.style.animation = 'none';
        void currentActive.offsetWidth;
        currentActive.style.animation = 'pulse 0.2s ease-in-out ';
      }
    }}
  ><span>14x</span></Button>
  <Button
    className={
      'bear button-15x' +
      (this.state.selected_roll === 'B' ? ' active' : '')
    }
    variant="contained"
    onClick={() => {
      this.onAddRun('1.5', 'B');
      const currentActive = document.querySelector('.active');
      if (currentActive) {
        currentActive.style.animation = 'none';
        void currentActive.offsetWidth;
        currentActive.style.animation = 'pulse 0.2s ease-in-out ';
      }
    }}
  ><span>1.5x</span></Button>
  <Button
    className={
      'bull button-7x' + (this.state.selected_roll === 'Bu' ? ' active' : '')
    }
    variant="contained"
    onClick={() => {
      this.onAddRun('7', 'Bu');
      const currentActive = document.querySelector('.active');
      if (currentActive) {
        currentActive.style.animation = 'none';
        void currentActive.offsetWidth;
        currentActive.style.animation = 'pulse 0.2s ease-in-out ';
      }
    }}
  ><span>7x</span></Button>
</div>

            <Button id="aiplay" onClick={this.onAutoPlay}>Test AI Play</Button>
            {/* <label>AUTOPLAY <input type="checkbox" onChange={()=>this.setState({autoplay: !this.state.autoplay})} />
</label> */}

          </div>
          <div className="rps-add-run-table roll-add-run-table">
            <h3 className="game-sub-title">Training Data</h3>
            <table id="runs">
              <tbody>
                {this.props.roll_list && this.props.roll_list.length > 0 ? (
                  this.props.roll_list.map((roll, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{roll.roll}x {roll.face}</td>
                      <td>
                        <HighlightOffIcon
                          onClick={() => this.onRemoveItem(index)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td id="add-run" colSpan="4">Provide the AI with example outputs</td>
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
  balance: state.auth.balance,
  auth: state.auth.isAuthenticated,
  isDarkMode: state.auth.isDarkMode,

});

export default connect(mapStateToProps)(Roll);
