import React from 'react';
import { Button } from '@material-ui/core';

function BetArray({ arrayName, label }) {
  const stored_bet_array = JSON.parse(localStorage.getItem(arrayName)) || [];

  const handleClearLocalStorage = () => {
    localStorage.removeItem(arrayName);
    window.location.reload(); // Reload the page to reflect the changes
  };

  return (
    <div className="gamified-container">
      <h2 className="gamified-heading">AI Training Data</h2>
      <div className="gamified-content">
        <div className="bet-array-grid">
          {stored_bet_array.map((item, index) => (
            <div key={index} className="array-item">
              {typeof item[label] === 'number'
                ? item[label].toFixed(2)
                : item[label]}
            </div>
          ))}
        </div>

        {stored_bet_array.length > 0 && (
          <div className="button-container">
            <Button
              className="clear-storage-btn"
              onClick={handleClearLocalStorage}
            >
              Reset
            </Button>
          </div>
        )}
        {stored_bet_array.length === 0 && (
          <div className="no-data-msg">Play normally to train the AI</div>
        )}
      </div>
    </div>
  );
}

export default BetArray;
