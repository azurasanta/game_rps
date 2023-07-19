import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import RedeemIcon from '@material-ui/icons/Redeem';
import PeopleAlt from '@material-ui/icons/PeopleAlt';
import SportsFootball from '@material-ui/icons/SportsFootball';
import Person from '@material-ui/icons/Person';
import TimeLine from '@material-ui/icons/Timeline';
import ExitToApp from '@material-ui/icons/ExitToApp';
import VpnKey from '@material-ui/icons/VpnKey';
import SettingsIcon from '@material-ui/icons/Settings';

import history from '../../redux/history';
import { connect } from 'react-redux';
import { adminSignOut } from '../../redux/AdminAuth/admin.actions';
import { setCurrentProductId, setCurrentProductInfo } from '../../redux/Item/item.action';
import styled from 'styled-components';
import { styleColor } from '../../Styles/styleThem';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 1,
  },
  drawerPaper: {
    paddingTop: 50,
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(10),
  },
  toolbar: theme.mixins.toolbar,
}));

function ClippedDrawer(props) {
  const { activeUrl, isAdmin, userName } = props;
  const classes = useStyles();

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  function handleLogout(e) {
    props.adminSignOut();
  }

  function navPush(url) {
    handleDrawerToggle();
    history.push(url);
  }

  const rdAdminMenu = () => (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader
          component="div"
          id="nested-list-subheader"
        >
          Admin
        </ListSubheader>
      }
    >
      <ListItem button onClick={() => navPush('/admin/question')}>
        <ListItemIcon>
          <RedeemIcon color={activeUrl.includes('/admin/question') ? 'secondary' : 'inherit'} />
        </ListItemIcon>
        <ListItemTextEl inputcolor={activeUrl.includes('/admin/question') ? 'true' : 'false'} primary="Manage Questions" />
      </ListItem>
      <ListItem button onClick={() => navPush('/admin/customers')}>
        <ListItemIcon>
          <PeopleAlt color={activeUrl === '/admin/customers' ? 'secondary' : 'inherit'} />
        </ListItemIcon>
        <ListItemTextEl inputcolor={activeUrl === '/admin/customers' ? 'true' : 'false'} primary="Customers" />
      </ListItem>
      <ListItem button onClick={() => navPush('/admin/activities')}>
        <ListItemIcon>
          <SportsFootball color={activeUrl === '/admin/activities' ? 'secondary' : 'inherit'} />
        </ListItemIcon>
        <ListItemTextEl inputcolor={activeUrl === '/admin/activities' ? 'true' : 'false'} primary="Customer Activities" />
      </ListItem>
      <ListItem button onClick={() => navPush('/admin/statistics')}>
        <ListItemIcon>
          <TimeLine color={activeUrl === '/admin/statistics' ? 'secondary' : 'inherit'} />
        </ListItemIcon>
        <ListItemTextEl inputcolor={activeUrl === '/admin/statistics' ? 'true' : 'false'} primary="Statistics" />
      </ListItem>
      <ListItem button onClick={() => navPush('/admin/settings')}>
        <ListItemIcon>
          <SettingsIcon color={activeUrl === '/admin/settings' ? 'secondary' : 'inherit'} />
        </ListItemIcon>
        <ListItemTextEl inputcolor={activeUrl === '/admin/settings' ? 'true' : 'false'} primary="System Settings" />
      </ListItem>
    </List>
  );

  const rdProfileMenu = () => (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader
          component="div"
          id="nested-list-subheader"
        >
          Profile
        </ListSubheader>
      }
    >
      <ListItem button onClick={() => {}}>
        <ListItemIcon>
          <Person />
        </ListItemIcon>
        <ListItemText primary="Edit Profile" />
      </ListItem>
      <ListItem button onClick={() => {}}>
        <ListItemIcon>
          <VpnKey />
        </ListItemIcon>
        <ListItemText primary="Change Password" />
      </ListItem>
      <ListItem button onClick={handleLogout}>
        <ListItemIcon>
          <ExitToApp/>
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
    </List>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap align="left" onClick={() => navPush('/app')}>
            RPSBet Admin
          </Typography>
          <div className={classes.grow}></div>
          <Typography noWrap align="right">
            {userName}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.toolbar} />
        {isAdmin ? rdAdminMenu() : ''}
        <Divider />
        {rdProfileMenu()}
      </Drawer>
      <main className={classes.content}>
          {props.children}
      </main>
    </div>
  );
}

const mapStateToProps = state => ({
    activeUrl: state.admin_auth.liveUrl,
    isAdmin: state.admin_auth.isAdmin,
    userName: state.admin_auth.userName
  });
  
const mapDispatchToProps = {
    adminSignOut,
    setCurrentProductId,
    setCurrentProductInfo
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ClippedDrawer);

const ListItemTextEl = styled(ListItemText)`
  color: ${props => (props.inputcolor === "true" ? styleColor.secondary.dark : 'white')};
  transition: all 0.2s ease-in-out;
  &:hover {
    color: ${styleColor.secondary.lite};
  }
`;