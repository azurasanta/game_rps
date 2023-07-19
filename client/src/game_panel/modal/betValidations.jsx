import { alertModal } from '../modal/ConfirmAlerts';


export const validateIsAuthenticated = (isAuthenticated, isDarkMode) => {
    if (!isAuthenticated) {
      alertModal(isDarkMode, `LOGIN TO PLAY THIS GAME, MTF!!`);
      return false;
    }
    return true;
  }
  
  export const validateCreatorId = (creator_id, user_id, isDarkMode) => {
    if (creator_id === user_id) {
      alertModal(
        isDarkMode,
        `DIS YOUR OWN STAKE CRAZY FOO-!`
      );
      return false;
    }
    return true;
  }
  
  export const validateBankroll = (bet_amount, bankroll, isDarkMode) => {
    if (bet_amount > bankroll) {
      alertModal(
        isDarkMode,
        `NOT ENOUGHT BANKROLL!`);
      return false;
    }
    return true;
  }
  

  export const validateBetAmount = (bet_amount, balance, isDarkMode) => {
    if (isNaN(bet_amount)) {
      alertModal(isDarkMode, 'ENTER A VALID NUMBER WANKER!');
      return false;
    }
  
    if (bet_amount <= 0) {
      alertModal(isDarkMode, `ENTER AN AMOUNT DUMBASS!`);
      return false;
    }
  
    if (bet_amount > balance) {
      alertModal(isDarkMode, `TOO BROKE FOR THIS BET`);
      return false;
    }
  
    return true;
  }
  
  export const validateLocalStorageLength = (storageName, isDarkMode) => {
    const storedArray = JSON.parse(localStorage.getItem(storageName)) || [];
    if (storedArray.length < 3) {
      alertModal(isDarkMode, "MORE TRAINING DATA NEEDED!");
      return false;
    }
    return true;
  };
  