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
    if (counts[state.bang]) {
      counts[state.bang]++;
    } else {
      counts[state.bang] = 1;
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
    sum += parseFloat(list[i].bang);
  }
  const average = sum / list.length;
  return parseFloat(average.toFixed(2));
};



class Bang extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected_bang: '',
      bet_amount: 10.00,
      bang: 1.00,
      balance: this.props.balance,
      winChance: 33,
      aveMultiplier: 0
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
  
  predictNext = (bangAmounts) => {
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
      bangAmounts.forEach((bang) => {
        const range = Math.floor((bang.bang - minValue) / rangeSize);
        rangeCounts[range] = rangeCounts[range] ? rangeCounts[range] + 1 : 1;
      });
  
      const totalCounts = bangAmounts.length;
      const rangeProbabilities = {};
      Object.keys(rangeCounts).forEach((range) => {
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
      
      const randomChance = Math.random();
      const newValue = parseFloat(getRandomNumberInRange(1, 1.06).toFixed(2));
      const isChanged = randomChance <= 0.41;
      
      if(isChanged){
        return newValue;
      } else {
        return parseFloat(getRandomNumberInRange(rangeMinValue, rangeMaxValue).toFixed(2));
      }
    }
  };
  
  
  

  onAutoPlay = () => {
    if (this.props.bang_list.length > 2) {
      const predictedNum = this.predictNext(this.props.bang_list);

      this.onAddRun(predictedNum);
    } else {
      alertModal(this.props.isDarkMode, 'MINIMUM 3 RUNS, TO MAKE A PREDICTION!!!');
    }
  };
  

  
  
  onRemoveItem = index => {
    this.props.playSound('tap');

    const newArray = this.props.bang_list.filter((elem, i) => i != index);
    // const bet_amount = calcBetAmount(newArray);
    const winChance = calcWinChance(newArray);
    const aveMultiplier = calcAveMultiplier(newArray);
    this.props.onChangeState({
      bang_list: newArray,
      winChance: winChance,
      aveMultiplier: aveMultiplier
    });

  };

  onAddRun = (bang) => {
    this.props.playSound('boop');

    // Ensure bang is a number
    const parsedDropAmount = parseFloat(bang);

    bang = parsedDropAmount;
    if (isNaN(bang)) {
      alertModal(this.props.isDarkMode, 'ENTER A VALID NUMBER');
      return;
    }
  
    this.setState({ bang: bang });
    const newArray = JSON.parse(JSON.stringify(this.props.bang_list));

  
    if (bang < 1) {
      bang = 1; 
    }
  
    newArray.push({
      bang: bang.toFixed(2)
    });

    const aveMultiplier = calcAveMultiplier(newArray);
    const winChance = calcWinChance(newArray);
    this.props.onChangeState({
      bang_list: newArray,
      winChance: winChance,
      aveMultiplier: aveMultiplier,
      bang: this.state.bet_amount
    });
    this.onChangeWinChance(winChance);

    this.onChangeAveMultiplier(aveMultiplier);
    this.setState({ winChance, aveMultiplier });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.bang_list.length !== this.props.bang_list.length) {
      const table = document.getElementById('runs');
      if (table) {
        table.scrollTop = table.scrollHeight;
      }
    }
  }


  handleHalfXButtonClick() {
    const multipliedBetAmount = this.state.bang * 0.5;
    const roundedBetAmount = Math.floor(multipliedBetAmount * 100) / 100;
    this.setState({
    bang: roundedBetAmount
    }, () => {
    document.getElementById("betamount").focus();
    });
    }

  handle2xButtonClick() {
    const maxBetAmount = this.state.balance;
    const multipliedBetAmount = this.state.bang * 2;
    const limitedBetAmount = Math.min(multipliedBetAmount, maxBetAmount, this.props.bet_amount);
    const roundedBetAmount = Math.floor(limitedBetAmount * 100) / 100;
    if (roundedBetAmount < -2330223) {
      alertModal(this.props.isDarkMode, "NOW, THAT'S GETTING A BIT CRAZY NOW ISN'T IT?");
    } else {
      this.setState({
        bang: roundedBetAmount
      }, () => {
      document.getElementById("betamount").focus();
      });
    }
  }

  
    handleMaxButtonClick() {
      const maxBetAmount = Math.floor(this.state.balance * 100) / 100;
      this.setState({
        bang: Math.min(maxBetAmount, this.props.bet_amount)
      }, () => {
      document.getElementById("betamount").focus();
      });
    }
  onChangeBetAmount = new_state => {
    this.setState({ bang: new_state.selected_bet_amount });
  };
  render() {
    
    const defaultBetAmounts = [10, 25, 50, 100, 250];

    return this.props.step === 1 ? (
      
      <div className="game-info-panel">
        {/* <h3 className="game-sub-title">Bankroll</h3> */}
        <DefaultBetAmountPanel
              bet_amount={this.props.bet_amount}
              onChangeState={this.props.onChangeState}
              game_type="Bang"
              defaultBetAmounts={defaultBetAmounts}
            />
     
      </div>
    ) : (
      
      <div className="game-info-panel">
                          {/* <h1> DEMO ONLY, GAME UNDER DEVELOPMENT 🚧</h1> */}

        <div className="rps-add-run-panel">
        <div className="bang-add-run-form">
           
            <h3 className="game-sub-title">
              Add some Bangs!{' '}
            </h3>
            <div className="bet-amount">
              <TextField
                type="text"
                pattern="[0-9]*"
                name="betamount"
                variant="outlined"
                id="betamount"
                maxLength="9"
                value={this.state.bang}
                onChange={(event) => this.setState({ bang: event.target.value })}
                placeholder="BET AMOUNT"
                InputProps={{
                  endAdornment: "BUSD",
                }}
              />
              <div>
              <div className='max'>
            <Button variant="contained" color="primary" onClick={() => this.handleHalfXButtonClick()}>0.5x</Button>
            <Button variant="contained" color="primary" onClick={() => this.handle2xButtonClick()}>2x</Button>
            <Button variant="contained" color="primary" onClick={() => this.handleMaxButtonClick()}>Max</Button>
          </div>
              </div>
              <div className='bang addRun'>
              <Button 
              id="bang-button"
                  onClick={() => {
                    this.onAddRun(this.state.bang);

                  }}>
                    Add Run
              </Button>
              </div>
            </div>
            <Button id="aiplay" onClick={this.onAutoPlay}>Test AI Play</Button>
            {/* <label>AUTOPLAY <input type="checkbox" onChange={()=>this.setState({autoplay: !this.state.autoplay})} />
</label> */}

          </div>
          <div className="rps-add-run-table bang-add-run-table">
            <h3 className="game-sub-title">Training Data</h3>
            <table id="runs">
              <tbody>
                {this.props.bang_list && this.props.bang_list.length > 0 ? (
                  this.props.bang_list.map((bang, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{bang.bang}x</td>
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

export default connect(mapStateToProps)(Bang);
