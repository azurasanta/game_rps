import React, { Component } from 'react';
import { initParams } from 'request';
import { convertToCurrency } from '../../util/conversion';
import { updateDigitToPoint2 } from '../../util/helper';
import { connect } from 'react-redux';
import { Button, TextField } from '@material-ui/core';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';

class DefaultBetAmountPanel extends Component {
  constructor(props) {
    super(props);
    const defaultBetAmounts = this.props.defaultBetAmounts
      ? this.props.defaultBetAmounts
      : [10.00, 25.00, 50.00, 100.00, 250.00];
    this.state = {
      defaultBetAmounts: defaultBetAmounts,
      isFocused: false,
      is_other:
        defaultBetAmounts.indexOf(this.props.bet_amount) < 0 ? true : false
    };
  }

  handleHalfXButtonClick = () => {
    const multipliedBetAmount = this.props.bet_amount * 0.5;
    const roundedBetAmount = Math.floor(multipliedBetAmount * 100) / 100;
    const newState = {
      bet_amount: roundedBetAmount
    };
    this.props.onChangeState(newState);
    document.getElementById("betAmount").focus();

  }
  
  handle2xButtonClick = () => {
    const multipliedBetAmount = this.props.bet_amount * 2;
    const updatedBetAmount = Math.min(multipliedBetAmount, this.props.balance);
  
    const newState = {
      bet_amount: updatedBetAmount
    };
  
    this.props.onChangeState(newState);
    document.getElementById("betAmount").focus();
  }
  
  
  

  handleMaxButtonClick = () => {
    const maxBetAmount = Math.floor(this.props.balance * 100) / 100; // round down to 2 decimal places
    if (this.props.game_type === 'Brain Game') {
      this.props.onChangeState({
        bet_amount: maxBetAmount
      });
    } else if (this.props.game_type === 'Quick Shoot') {
      this.props.onChangeState({
        bet_amount: maxBetAmount,
        public_bet_amount: convertToCurrency(
          (this.props.qs_game_type - 1) * maxBetAmount
        ),
        max_return: this.props.qs_game_type * maxBetAmount
      });
    } else {
      this.props.onChangeState({
        bet_amount: maxBetAmount,
        max_return: maxBetAmount * 2
      });
    }
    document.getElementById("betAmount").focus();

  }


  componentDidUpdate(prevProps, prevState) {
    if (this.props.bet_amount !== prevProps.bet_amount) {
      document.getElementById('betAmount').focus();
    }
  }

  handleFocus = () => {
    this.setState({ isFocused: true });
  };

  handleBlur = (event) => {
    event.stopPropagation();
    this.setState({ isFocused: false });
  };

  formatBetAmount = (amount) => {
    const roundedAmount = Math.floor(amount * 100) / 100;
    return roundedAmount.toFixed(2);
  };

  render() {
    const isDarkMode = this.props.isDarkMode;
    const theme = createTheme({
      overrides: {
        MuiOutlinedInput: {
          adornedEnd: {
            paddingRight: '6px',
          },
          root: {
            '& $notchedOutline': {
              borderColor: 'gray',
              transition: 'border-color 0.3s ease-in-out',
              paddingRight: '6px',
            },
            '&:hover $notchedOutline': {
              borderColor: 'gray',
            },
            '&$focused $notchedOutline': {
              borderColor: 'red',
              boxShadow: '0 0 0 4px rgba(255, 0, 0, 0.3)',
            },
            '&$focused': {
              backgroundColor: '#10101011',
            },
            '&:not($focused):not($error) $notchedOutline': {
              borderColor: isDarkMode ? 'white' : '#101010',
            },
            '& input': {
              color: isDarkMode ? 'white' : '#101010',
              backgroundColor: '#10101011',
            },
          },
          input: {
            '&::placeholder': {
              color: 'gray',
            },
          },
        },
        MuiFormLabel: {
          root: {
            color: isDarkMode ? 'white' : '#101010',
          },
        },
      },
    });

    const {defaultBetAmounts,isFocused, is_other} = this.state;
    
    const {bet_amount, game_type, onChangeState, qs_game_type} = this.props;
   
    const formattedBetAmount = this.formatBetAmount(bet_amount);
    return (
      <div className="default-bet-amount-panel game-info-panel">
        <h3 className="game-sub-title">BANKROLL</h3>
        <div className="bet-amounts">
          {defaultBetAmounts.map((amount, index) => (
            <Button
              className={
                !is_other && bet_amount === amount
                  ? ' active'
                  : ''
              }
              onClick={() => {
                this.setState({ is_other: false });
                if (game_type === 'Brain Game') {
                  onChangeState({ bet_amount: amount });
                } else if (game_type === 'Quick Shoot') {
                  onChangeState({
                    bet_amount: amount,
                    public_bet_amount: convertToCurrency(
                      (qs_game_type - 1) * amount
                    ),
                    max_return: qs_game_type * amount
                  });
                } else {
                  onChangeState({
                    bet_amount: amount,
                    max_return: amount * 2 /* * 0.95 */
                  });
                }
              }}
              key={index}
            >
              {convertToCurrency(updateDigitToPoint2(amount))}
            </Button>
          ))}
          <Button
            className={is_other ? 'other active' : 'other'}
            onClick={() => {
              this.setState({ is_other: true });
            }}
          >
            Other
          </Button>
        </div>
        <div
          className={`edit-amount-panel ${is_other ? '' : 'hidden'}`}
        >
            <div className='bet-amount'> 
          <ThemeProvider theme={theme}>

          
          <TextField
            type="text"
            name="betamount"
            id="betAmount"
            variant="outlined"
            value={formattedBetAmount}
            inputProps={{
              pattern: '[0-9]*',
              maxLength: 9
            }}
            InputLabelProps={{
              shrink: true
            }}
            InputProps={{
              onFocus: this.handleFocus,
              onBlur: this.handleBlur,
              endAdornment: (
                <ButtonGroup
                  className={isFocused ? 'fade-in' : 'fade-out'}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => this.handle2xButtonClick()}
                    style={{ marginTop: '8px' }}
                  >
                    2x
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => this.handleHalfXButtonClick()}
                    style={{ marginTop: '8px' }}
                  >
                    1/2x
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => this.handleMaxButtonClick()}
                    style={{ marginTop: '8px' }}
                  >
                    Max
                  </Button>
                </ButtonGroup>
              ),
            }}
            onChange={e => {
              if (this.props.game_type === 'Brain Game') {
                this.props.onChangeState({ bet_amount: e.target.value });
              } else if (this.props.game_type === 'Quick Shoot') {
                this.props.onChangeState({
                  bet_amount: parseInt(e.target.value) || '',
                  public_bet_amount: convertToCurrency(
                    updateDigitToPoint2(
                      (this.props.qs_game_type - 1) *
                        (parseInt(e.target.value) || '')
                    )
                  ),
                  max_return: this.props.qs_game_type * e.target.value
                });
              } else {
                this.props.onChangeState({
                  bet_amount: parseInt(e.target.value) || '',
                  max_return: (parseInt(e.target.value) || 0) * 2 /* * 0.95 */
                });
              }
            }}
          /></ThemeProvider>
           </div>
           
        </div>
        {this.props.game_type === 'RPS' ? (
          <p className="tip">SET THE INITIAL 'POT' FOR THIS GAME</p>
        ) : (
          <p className="tip">The cost to play this game</p>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth.isAuthenticated,
  socket: state.auth.socket,
  balance: state.auth.balance,
  isDarkMode: state.auth.isDarkMode
});

const mapDispatchToProps = {};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DefaultBetAmountPanel);
