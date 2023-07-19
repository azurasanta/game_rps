import React, { useState, useEffect  } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';




export default function BetAmountInput(props) {
  const {
    betAmount,
    handle2xButtonClick,
    handleHalfXButtonClick,
    handleMaxButtonClick,
    onChange,
    isDarkMode
  } = props;

  const theme = createTheme({
    overrides: {
      
      MuiOutlinedInput: {
        adornedEnd: {
          paddingRight: '6px',
        },
        root: {
          '& $notchedOutline': {
            borderColor: 'gray', // Set initial border color to gray
            transition: 'border-color 0.3s ease-in-out',
            paddingRight: '6px',
          },
          '&:hover $notchedOutline': {
            borderColor: 'gray', // Set hover border color to gray
          },
          '&$focused $notchedOutline': {
            borderColor: 'red', // Set focused border color to red
            boxShadow: '0 0 0 4px rgba(255, 0, 0, 0.3)', // Add red glow outline
          },
          '&$focused': {
            backgroundColor: '#10101011', // Set focused background color to black
          },
          '&:not($focused):not($error) $notchedOutline': {
            borderColor: isDarkMode ? 'white' : '#101010',
          },
          '& input': {
            color: isDarkMode ? 'white' : '#101010',
            backgroundColor: '#10101011', // Set the input background color to black
          },
        },
        input: {
          '&::placeholder': {
            color: 'gray', // Set the placeholder color to gray
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
  
  

  const [isFocused, setIsFocused] = useState(false);
  const [isButtonGroupVisible, setIsButtonGroupVisible] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setIsButtonGroupVisible(true);
    } else {
      const timeoutId = setTimeout(() => {
        setIsButtonGroupVisible(false);
      }, 0); // Adjust the timeout value as needed
      return () => clearTimeout(timeoutId);
    }
  }, [isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (event) => {
    event.stopPropagation();
    setIsFocused(false);
  };

  const formatBetAmount = (amount) => {
    const roundedAmount = Math.floor(amount * 100) / 100;
    return roundedAmount.toFixed(2);
  };
  
  const formattedBetAmount = formatBetAmount(betAmount);

  return (
    <div className="bet-amount">
      <ThemeProvider theme={theme}>
        <TextField
          type="text"
          name="betamount"
          variant="outlined"
          id="betamount"
          label="BET AMOUNT"
          value={formattedBetAmount}
          onChange={onChange}
          placeholder="BET AMOUNT"
          inputProps={{
            pattern: '[0-9]*',
            maxLength: 9,
          }}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            onFocus: handleFocus,
            onBlur: handleBlur,
            endAdornment: (
              <ButtonGroup
                className={isButtonGroupVisible ? 'fade-in' : 'fade-out'}
                style={{ visibility: isButtonGroupVisible ? 'visible' : 'hidden' }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handle2xButtonClick}
                  style={{ marginBottom: '8px' }}
                >
                  2x
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleHalfXButtonClick}
                  style={{ marginBottom: '8px' }}
                >
                  1/2x
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleMaxButtonClick}
                >
                  Max
                </Button>
              </ButtonGroup>
            ),
          }}
        />
      </ThemeProvider>
    </div>
  );
}