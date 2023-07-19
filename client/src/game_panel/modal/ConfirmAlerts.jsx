import React from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { FormControlLabel, Button, Checkbox } from '@material-ui/core/';
const showAlert = (isDarkMode, text, icon) => {
  confirmAlert({
    customUI: ({ onClose }) => {
      return (
        <div className={isDarkMode ? 'dark_mode' : ''}>
          <div className="modal-body alert-body">
            <Button className="btn-close" onClick={onClose}>
              ×
            </Button>
            <div className={`modal-icon alert-icon${icon}`}></div>
            <h5>{text}</h5>
          </div>
        </div>
      );
    }
  });
};
export const alertModal = (isDarkMode, text) => {
  showAlert(isDarkMode, text, '');
};

const showConfirm = (
  isDarkMode,
  text,
  icon,
  okayButtonTitle,
  cancelButtonTitle,
  callback
) => {
  confirmAlert({
    customUI: ({ onClose }) => {
      return (
        <div className={isDarkMode ? 'dark_mode' : ''}>
          <div className="modal-body alert-body confirm-body">
            <Button className="btn-close" onClick={onClose}>
              ×
            </Button>
            <div className={`modal-icon alert-icon${icon}`}></div>
            <h5>{text}</h5>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  onChange={event =>
                    localStorage.setItem(
                      'hideConfirmModal',
                      event.target.checked
                    )
                  }
                />
              }
              label="DON'T SHOW ME THIS SH*T"
            />

            <div className="modal-footer">
              <Button
                className="btn-submit"
                onClick={() => {
                  callback();
                  onClose();
                }}
              >
                {okayButtonTitle}
              </Button>
              {cancelButtonTitle && (
                <Button className="btn-back" onClick={onClose}>
                  {cancelButtonTitle}
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }
  });
};
export const confirmModalCreate = (
  isDarkMode,
  text,
  okayButtonTitle,
  cancelButtonTitle,
  callback
) => {
  showConfirm(
    isDarkMode,
    text,
    '-create',
    okayButtonTitle,
    cancelButtonTitle,
    callback
  );
};
export const confirmModalClosed = (
  isDarkMode,
  text,
  okayButtonTitle,
  cancelButtonTitle,
  callback
) => {
  showConfirm(
    isDarkMode,
    text,
    '-closed',
    okayButtonTitle,
    cancelButtonTitle,
    callback
  );
};
const showResultModal = (
  isDarkMode,
  text,
  icon,
  cancelButtonTitle,
  callback,
  callback2
) => {
  let timeLeft = 1500; // duration of modal in milliseconds
  const intervalId = setInterval(() => {
    timeLeft -= 100;
    if (timeLeft === 0) {
      clearInterval(intervalId);
    }
  }, 100); // countdown interval
  confirmAlert({
    overlayClassName: 'overlay-result',
    closeOnEscape: false,
    closeOnClickOutside: false,
    customUI: ({ onClose }) => {
      setTimeout(() => onClose(), 1500); // dismiss modal after 2 seconds
      return (
        <div className={isDarkMode ? 'dark_mode' : ''}>
          <div className="modal-body alert-body result-body">
            <div className={`modal-icon result-icon${icon}`}></div>
            <h1>{text}</h1>
            <div className="modal-footer">
              {/* { cancelButtonTitle &&
                                <button className="btn-back" onClick={() => {callback2(); onClose();}}>{cancelButtonTitle}</button>
                            } */}
              <div className="countdown-timer">
                <div
                  className="countdown-bar"
                  style={{ width: `${(timeLeft / 1500) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  });
};
export const gameResultModal = (
  isDarkMode,
  text,
  gameResult,
  cancelButtonTitle,
  callback,
  callback2
) => {
  let icon = '-lost';
  if (gameResult === 0) {
    icon = '-draw';
  } else if (gameResult === 1) {
    icon = '-win';
  }
  showResultModal(
    isDarkMode,
    text,
    icon,
    cancelButtonTitle,
    callback,
    callback2
  );
};
