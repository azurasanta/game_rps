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
    if (counts[state.drop]) {
      counts[state.drop]++;
    } else {
      counts[state.drop] = 1;
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

class DropGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected_drop: '',
      bet_amount: 10.00,
      drop: 0.01,
      balance: this.props.balance,
      winChance: 33,
      // is_other: (this.props.bet_amount === 5 || this.props.bet_amount === 10 || this.props.bet_amount === 25 || this.props.bet_amount === 50 || this.props.bet_amount === 100) ? 'hidden' : '',


    };
    // this.onChangeBetAmount = this.onChangeBetAmount.bind(this);

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
    // this.props.onChangeState({ winChance });
  };
  
  predictNext = (dropAmounts) => {
    // Find the unique values in dropAmounts
    const uniqueValues = [...new Set(dropAmounts.map(drop => drop.drop))];
    
    if (uniqueValues.length === 1) {
      // If there is only one unique value, return that value
      return uniqueValues[0];
    } else {
      // Otherwise, compute the range and generate a random number within that range
      const minValue = Math.min(...uniqueValues);
      const maxValue = Math.max(...uniqueValues);
      const rangeSize = Math.ceil((maxValue - minValue) / 200);
    
      const rangeCounts = {};
      dropAmounts.forEach((drop) => {
        const range = Math.floor((drop.drop - minValue) / rangeSize);
        rangeCounts[range] = rangeCounts[range] ? rangeCounts[range] + 1 : 1;
      });
    
      const totalCounts = dropAmounts.length;
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
      return parseFloat(getRandomNumberInRange(rangeMinValue, rangeMaxValue).toFixed(2));
    }
  };
  
  

  onAutoPlay = () => {
    if (this.props.drop_list.length > 2) {
      const predictedNum = this.predictNext(this.props.drop_list);

      this.onAddRun(predictedNum);
    } else {
      alertModal(this.props.isDarkMode, 'MINIMUM 3 RUNS, TO MAKE A PREDICTION!!!');
    }
  };
  

  
  
  onRemoveItem = index => {
    this.props.playSound('tap');

    const newArray = this.props.drop_list.filter((elem, i) => i != index);
    // const bet_amount = calcBetAmount(newArray);
    const winChance = calcWinChance(newArray);
    this.props.onChangeState({
      drop_list: newArray,
      // bet_amount: bet_amount,
      // max_return: bet_amount * 2 /* 0.95 */,
      winChance: winChance
    });

  };

  onAddRun = (drop) => {
    this.props.playSound('boop');

    // Ensure drop is a number
    const parsedDropAmount = parseFloat(drop);

    drop = parsedDropAmount;
    if (isNaN(drop)) {
      alertModal(this.props.isDarkMode, 'ENTER A VALID NUMBER');
      return;
    }
  
    this.setState({ drop: drop });
    const newArray = JSON.parse(JSON.stringify(this.props.drop_list));

  
    // // Check if the drop_list is empty and if the drop value exceeds this.props.bet_amount
    // if (newArray.length === 0 && drop > this.props.bet_amount) {
    //   drop = this.props.bet_amount; // Set the drop value to this.props.bet_amount
    // }
  
    newArray.push({
      drop: drop
    });


    const winChance = calcWinChance(newArray);
    this.props.onChangeState({
      drop_list: newArray,
      winChance: winChance,
      drop: this.state.bet_amount
    });
    this.onChangeWinChance(winChance);
    this.setState({ winChance });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.drop_list.length !== this.props.drop_list.length) {
      const table = document.getElementById('runs');
      if (table) {
        table.scrollTop = table.scrollHeight;
      }
    }
  }


  handleHalfXButtonClick() {
    const multipliedBetAmount = this.state.drop * 0.5;
    const roundedBetAmount = Math.floor(multipliedBetAmount * 100) / 100;
    this.setState({
    drop: roundedBetAmount
    }, () => {
    document.getElementById("betamount").focus();
    });
    }

  handle2xButtonClick() {
    const maxBetAmount = this.state.balance;
    const multipliedBetAmount = this.state.drop * 2;
    const limitedBetAmount = Math.min(multipliedBetAmount, maxBetAmount, this.props.bet_amount);
    const roundedBetAmount = Math.floor(limitedBetAmount * 100) / 100;
    if (roundedBetAmount < -2330223) {
      alertModal(this.props.isDarkMode, "NOW, THAT'S GETTING A BIT CRAZY NOW ISN'T IT?");
    } else {
      this.setState({
        drop: roundedBetAmount
      }, () => {
      document.getElementById("betamount").focus();
      });
    }
  }

  
    handleMaxButtonClick() {
      const maxBetAmount = (this.state.balance).toFixed(2);
      this.setState({
        drop: Math.min(maxBetAmount, this.props.bet_amount)
      }, () => {
      document.getElementById("betamount").focus();
      });
    }
  onChangeBetAmount = new_state => {
    this.setState({ drop: new_state.selected_bet_amount });
  };
  render() {
    
    const defaultBetAmounts = [10, 25, 50, 100, 250];

    return this.props.step === 1 ? (
      
      <div className="game-info-panel">
        {/* <h3 className="game-sub-title">Bankroll</h3> */}
        <DefaultBetAmountPanel
              bet_amount={this.props.bet_amount}
              onChangeState={this.props.onChangeState}
              game_type="DropGame"
              defaultBetAmounts={defaultBetAmounts}
            />
     
      </div>
    ) : (
      
      <div className="game-info-panel">
                          {/* <h1> DEMO ONLY, GAME UNDER DEVELOPMENT 🚧</h1> */}

        <div className="rps-add-run-panel">
        <div className="drop-add-run-form">
           
            <h3 className="game-sub-title">
              Drop some amounts!{' '}
            </h3>
            <div className="your-bet-amount">
              <TextField
                type="text"
                pattern="[0-9]*"
                name="betamount"
                variant="outlined"
                id="betamount"
                maxLength="9"
                value={this.state.drop}
                onChange={(event) => this.setState({ drop: event.target.value })}
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
              <div className='drop addRun'>
              <Button 
              id="drop-button"
                  onClick={() => {
                    this.onAddRun(this.state.drop);

                  }}>
                    Add Run
              </Button>
              </div>
            </div>
            <Button id="aiplay" onClick={this.onAutoPlay}>Test AI Play</Button>
            {/* <label>AUTOPLAY <input type="checkbox" onChange={()=>this.setState({autoplay: !this.state.autoplay})} />
</label> */}

          </div>
          <div className="rps-add-run-table drop-add-run-table">
            <h3 className="game-sub-title">Training Data</h3>
            <table id="runs">
              <tbody>
                {this.props.drop_list && this.props.drop_list.length > 0 ? (
                  this.props.drop_list.map((drop, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{drop.drop}</td>
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

export default connect(mapStateToProps)(DropGame);
