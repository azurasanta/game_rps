import React from 'react';
import clsx from 'clsx';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import { amber, green } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { makeStyles } from '@material-ui/core/styles';
import { closeMsgBar } from '../redux/Notification/notification.actions';

import { connect } from 'react-redux';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
};

const useStyles1 = makeStyles(theme => ({
  success: {
    backgroundColor: '#28a745',
    borderRadius: '14px',
    color: 'white'
  },
  error: {
    backgroundColor: '#c438ef',
    borderRadius: '14px',
    color: 'white'
  },
  info: {
    backgroundColor: '#3f00ee',
    borderRadius: '14px',
    color: 'white'
  },
  warning: {
    backgroundColor: '#ff6a9c',
    borderRadius: '14px',
    color: 'white'
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
}));

function MySnackbarContentWrapper(props) {
  const classes = useStyles1();
  const { className, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={clsx(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={clsx(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton
          key="close"
          aria-label="close"
          color="default"
          onClick={onClose}
        >
          <CloseIcon className={classes.icon} />
        </IconButton>
      ]}
      {...other}
    />
  );
}

function CustomizedSnackbar({ openSk, closeMsgBar, message, status }) {
  function handleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    closeMsgBar();
  }

  return (
    <>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={openSk}
        autoHideDuration={2000}
        onClose={handleClose}
      >
        <MySnackbarContentWrapper
          onClose={handleClose}
          variant={status}
          message={message}
        />
      </Snackbar>
    </>
  );
}

const mapStateToProps = state => ({
  openSk: state.snackbar.openSk,
  message: state.snackbar.message,
  status: state.snackbar.status
});

const mapDispatchToProps = {
  closeMsgBar
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomizedSnackbar);
