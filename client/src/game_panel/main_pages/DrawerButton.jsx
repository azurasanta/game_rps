import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import { Chat, Close } from '@material-ui/icons';

const DrawerButton = ({ open, toggleDrawer }) => (
  <IconButton
    id="drawer-btn"
    color="white"
    onClick={toggleDrawer}
  >
    {open ? <Close /> : <Chat />}
  </IconButton>
);

export default DrawerButton;
