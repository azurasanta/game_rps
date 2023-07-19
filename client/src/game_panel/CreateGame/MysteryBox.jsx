import React, { Component } from 'react';
import { convertToCurrency } from '../../util/conversion';
import { alertModal } from '../modal/ConfirmAlerts';
import { Box, Button, TextField } from '@material-ui/core';
import { connect } from 'react-redux';

class MysteryBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      new_box_price: '',
      new_box_prize: '',
      winChance: 100,
      endgame_amount: 25
    };
  }

  
  onChangeNewBoxPrize = e => {
    this.setState({ new_box_prize: e.target.value });
  };

  onChangeNewBoxPrice = e => {
    this.setState({ new_box_price: e.target.value });
  };

  calcMaxReturn = box_list => {
    let max_return = 0;
    let max_prize = 0;
    let lowest_box_price = -1;
    let highest_box_price = 0;

    box_list.map(row => {
      if (lowest_box_price === -1 || lowest_box_price > row.box_price) {
        lowest_box_price = row.box_price;
      }

      if (highest_box_price < row.box_price) {
        highest_box_price = row.box_price;
      }

      if (row.box_prize >= row.box_price) {
        max_return += row.box_prize;
      } else {
        max_return += row.box_price;
      }

      if (max_prize < row.box_prize) {
        max_prize = row.box_prize;
      }

      return true;
    }, this);

    return { max_return, max_prize, lowest_box_price, highest_box_price };
  };

  addBoxes = (e, numBoxes) => {
    e.preventDefault();
  
    let new_box_price = parseFloat(this.state.new_box_price);
    let new_box_prize = parseFloat(this.state.new_box_prize);
  
    if (
      new_box_price <= 0 ||
      new_box_price === undefined ||
      new_box_price === '' ||
      isNaN(new_box_price)
    ) {
      alertModal(
        this.props.isDarkMode,
        `BOX PRICE MUST BE MORE THAN ZERO: NO FREE SAMPLES!`
      );
      return;
    }
  
    if (new_box_prize < 0 || isNaN(new_box_price)) {
      alertModal(this.props.isDarkMode, `WHAT KIND OF F*CKING PRIZE IS THAT?!`);
      return;
    }
  
    new_box_price = isNaN(new_box_price) ? 0 : new_box_price;
    new_box_prize = isNaN(new_box_prize) ? 0 : new_box_prize;
  
    let box_list = this.props.box_list;
  
    const delay = 1000 / numBoxes;
    let timeDelay = 0;
  
    for (let i = 0; i < numBoxes; i++) {
      setTimeout(() => {
        box_list = box_list.concat({
          box_price: new_box_price,
          box_prize: new_box_prize,
        });
  
        const bet_amount = box_list.reduce(
          (totalAmount, box) => totalAmount + box.box_prize,
          0
        );
        const max_return = this.calcMaxReturn(box_list);
  
        this.props.onChangeState({
          box_list: box_list,
          winChance: this.props.calcMysteryBoxEV(
            box_list,
            max_return['max_return'],
            max_return['max_return']
          ),
          bet_amount: bet_amount,
          max_return: max_return['max_return'],
          max_prize: max_return['max_prize'],
          endgame_amount: max_return['max_return'],
          lowest_box_price: max_return['lowest_box_price'],
          public_bet_amount:
            max_return['lowest_box_price'] === max_return['highest_box_price'] ? (
              convertToCurrency(max_return['lowest_box_price'])
            ) : (
              <>
                {convertToCurrency(max_return['lowest_box_price'])} -{' '}
                {convertToCurrency(max_return['highest_box_price'])}
              </>
            ),
        });
      }, timeDelay);
  
      timeDelay += delay;
    }
  
    this.setState({
      new_box_price: '',
      new_box_prize: '',
    });
  
  };
  

  onAddBox = e => {
    this.addBoxes(e, 1);
    this.props.playSound('addBox');
  };

  onAddTenBoxes = e => {
    this.addBoxes(e, 10);
    this.props.playSound('addTen');
  };

  updateBoxList = newBoxList => {
    if (newBoxList.length === 0) {
      this.props.onChangeState({
        box_list: [],
      });
      return;
    }

    const bet_amount = newBoxList.reduce(
      (totalAmount, box) => totalAmount + box.box_prize,
      0
    );
    const max_return = this.calcMaxReturn(newBoxList);

    this.props.onChangeState({
      box_list: newBoxList,
      bet_amount: bet_amount,
      winChance: this.props.calcMysteryBoxEV(newBoxList, max_return['max_return'], max_return['max_return']),
      max_return: max_return['max_return'],
      max_prize: max_return['max_prize'],
      endgame_amount: max_return['max_return'],
      lowest_box_price: max_return['lowest_box_price'],
      public_bet_amount:
        max_return['lowest_box_price'] === max_return['highest_box_price'] ? (
          convertToCurrency(max_return['lowest_box_price'])
        ) : (
          <>
            {convertToCurrency(max_return['lowest_box_price'])} -{' '}
            {convertToCurrency(max_return['highest_box_price'])}
          </>
        )
    });
  };

  onRemoveBox = e => {
    e.preventDefault();
    this.props.playSound('tap');
    let box_list = this.props.box_list;
    box_list.splice(e.target.getAttribute('index'), 1);
    this.updateBoxList(box_list);
  };

  onEmptyBoxes = e => {
    e.preventDefault();
    this.updateBoxList([]);
  };

  // componentDidUpdate(prevProps) {
  //   if (prevProps.endgame_amount !== this.props.endgame_amount) {
  //     const winChance = this.calcWinChance(this.props.box_list, this.props.endgame_amount);
  //     this.setState(winChance);
  //   }

  // }
  render() {
    return (
      <div className="game-info-panel">
        <h3 className="game-sub-title">Create a box</h3>
        <div className="boxes-panel">
          {this.props.box_list.map(
            (row, key) => (
              <div className="box" key={key}>
                <i title="Delete Box?" onClick={this.onRemoveBox} index={key}>
                  -
                </i>
                <span>
                  {row.box_prize === 0.0
                    ? 'EMPTY'
                    : convertToCurrency(row.box_prize)}{' '}
                  / {convertToCurrency(row.box_price)}
                </span>
              </div>
            ),
            this
          )}
        </div>
        <div className="create-box-panel">
          <div className="amounts-panel">
            <div>
              <div className="edit-amount-panel">
                <TextField
                  variant="outlined"
                  type="text"
                  inputProps={{
                    pattern: '[0-9]*',
                    maxLength: 9
                  }}
                  style={{ marginRight: '15px' }}
                  InputLabelProps={{
                    shrink: true
                  }}
                  name="new_box_prize"
                  id="new_box_prize"
                  value={this.state.new_box_prize}
                  onChange={this.onChangeNewBoxPrize}
                  placeholder="PRIZE"
                  InputProps={{
                    endAdornment: 'BUSD'
                  }}
                />
              </div>
            </div>
            <div>
              <div className="edit-amount-panel">
                <TextField
                  type="text"
                  variant="outlined"
                  inputProps={{
                    pattern: '[0-9]*',
                    maxLength: 9
                  }}
                  InputLabelProps={{
                    shrink: true
                  }}
                  name="new_box_price"
                  id="new_box_price"
                  value={this.state.new_box_price}
                  onChange={this.onChangeNewBoxPrice}
                  placeholder="PRICE"
                  InputProps={{
                    endAdornment: 'BUSD'
                  }}
                />
              </div>
            </div>
          </div>
          <div class="box-btn-row">
            <Button className="other" onClick={this.onAddBox}>
              Add box
            </Button>
            <Button id="add-ten" onClick={this.onAddTenBoxes}>
              Add 10 boxes
            </Button>
          </div>

          <Button
        id="reset"
            href="/#"
            onClick={this.onEmptyBoxes}
            title="Empty all boxes?"
          >
            Reset
          </Button>
        </div>
        <p className="tip">
          Boxes will be displayed to the public in the order you have added
          them.
        </p>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth.isAuthenticated,
  isDarkMode: state.auth.isDarkMode
});

export default connect(mapStateToProps)(MysteryBox);
