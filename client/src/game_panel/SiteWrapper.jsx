import React, { Component } from 'react';
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import LoadingOverlay from 'react-loading-overlay';
import ReactApexChart from 'react-apexcharts';
import Battle from './icons/Battle.js';
import BattleHover from './icons/BattleHover';
import Manage from './icons/Manage.js';
import ManageHover from './icons/ManageHover';
import HowTo from './icons/HowTo.js';
import CountUp from 'react-countup';
import Lottie from 'react-lottie';
import progress from './LottieAnimations/progress.json';
import HowToHover from './icons/HowToHover';
import {
  setSocket,
  userSignOut,
  getUser,
  setUnreadMessageCount,
  setDarkMode,
  toggleMute
} from '../redux/Auth/user.actions';
import {
  setRoomList,
  addChatLog,
  getMyGames,
  getMyHistory,
  getHistory,
  addNewTransaction,
  updateOnlineUserList,
  selectMainTab,
  globalChatReceived,
  setGlobalChat,
  updateBetResult
} from '../redux/Logic/logic.actions';

import {
  Tabs,
  Tab,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@material-ui/core';

import AccountBalanceWallet from '@material-ui/icons/AccountBalanceWallet';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';

import history from '../redux/history';
import socketIOClient from 'socket.io-client';

import ProfileModal from './modal/ProfileModal';
import PlayerModal from './modal/PlayerModal';
import HowToPlayModal from './modal/HowToPlayModal';

import GamePasswordModal from './modal/GamePasswordModal';
import LoginModal from './modal/LoginModal';
import SignupModal from './modal/SignupModal';
import VerificationModal from './modal/VerificationModal';
import DepositModal from './modal/DepositModal';
import WithdrawModal from './modal/WithdrawModal';
import ResetPasswordModal from './modal/ResetPasswordModal';

import Moment from 'moment';
import { updateDigitToPoint2 } from '../util/helper';
import './SiteWrapper.css';
import Avatar from '../components/Avatar';
import Web3 from 'web3';
import abi from '../config/abi_token.json';
import { tokenAddr } from '../config/index.js';
import { convertToCurrency } from '../util/conversion';

LoadingOverlay.propTypes = undefined;

const customTextFieldStyles = {
  MuiOutlinedInput: {
    root: {
      '&:hover $notchedOutline': {
        borderColor: 'currentColor'
      },
      '&$focused $notchedOutline': {
        borderColor: 'currentColor'
      },
      '& input:-webkit-autofill': {
        '-webkit-box-shadow': '0 0 0 100px transparent inset',
        '-webkit-text-fill-color': 'currentColor'
      }
    },
    notchedOutline: {},
    focused: {}
  },
  MuiInputBase: {
    input: {
      '&$focused': {
        backgroundColor: 'transparent'
      },
      '&:-webkit-autofill': {
        '-webkit-box-shadow': '0 0 0 100px inherit inset',
        '-webkit-text-fill-color': 'currentColor'
      }
    },
    focused: {}
  }
};

const mainTheme = createTheme({
  palette: {
    type: 'light'
  },
  overrides: customTextFieldStyles // Add the TextField style overrides
});

const darkTheme = createTheme({
  palette: {
    type: 'dark'
  },
  overrides: customTextFieldStyles // Add the TextField style overrides
});

const customStyles = {
  tabRoot: {
    textTransform: 'none',
    // height: '48px',
    minWidth: '80px'
  }
};

const gifUrls = [
  'https://uploads-ssl.webflow.com/6097a2499efec713b2cb1c07/641ef8e1ce09cd9cf53a4829_rock1.gif',
  'https://uploads-ssl.webflow.com/6097a2499efec713b2cb1c07/641ef98d7e17a610c3ed83b9_paper2.gif',
  'https://uploads-ssl.webflow.com/6097a2499efec713b2cb1c07/641efdcadd850ab47a768e04_scissors1.gif'
];
const randomGifUrl = gifUrls[Math.floor(Math.random() * gifUrls.length)];
const hueRotateValue = (gifUrls.indexOf(randomGifUrl) + 1) * 75;

const { SpeechSynthesis } = window.speechSynthesis;

function updateFromNow(transactions) {
  const result = JSON.parse(JSON.stringify(transactions));
  for (let i = 0; i < result.length; i++) {
    result[i]['from_now'] = Moment(result[i]['created_at']).fromNow();
  }
  return result;
}

class SiteWrapper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      endpoint:
        process.env.NODE_ENV === 'production'
          ? 'https://rps.game'
          : `http://${window.location.hostname}:5001`,
      userName: this.props.userName,
      balance: this.props.balance,
      oldBalance: this.props.balance,
      hoverTabIndex: -1,
      betResult: this.props.betResult,
      showProfileModal: false,
      showPlayerModal: false,
      showHowToPlayModal: false,
      isPlaying: false,
      showLoginModal: false,
      showSignupModal: false,
      showVerificationModal: false,
      showWithdrawModal: false,
      showDepositModal: false,
      showResetPasswordModal: false,
      showGameLog: false,
      transactions: updateFromNow(this.props.transactions),
      anchorEl: null,
      websiteLoading: true,

      web3: null,
      web3account: '',
      web3balance: 0
    };
  }
  static getDerivedStateFromProps(props, currentState) {
    const { balance, betResult, userName } = props;

    if (
      currentState.balance !== balance ||
      currentState.betResult !== betResult ||
      currentState.userName !== userName
    ) {
      return {
        ...currentState,
        balance,
        userName,
        transactions: updateFromNow(props.transactions),
        betResult
      };
    }

    return null;
  }

  handleMainTabChange = (event, newValue) => {
    const { selectMainTab } = this.props;
    if (window.location.pathname !== '/') {
      history.push('/');
    }
    selectMainTab(newValue);
  };

  handleMouseEnter = index => {
    this.setState({ hoverTabIndex: index });
  };

  handleMouseLeave = () => {
    this.setState({ hoverTabIndex: -1 });
  };

  handleMute = () => {
    const audioElements = [
      this.audioWin,
      this.audioSplit,
      this.audioLose,
      this.fatality,
      this.nyan,
      this.topG,
      this.oohBaby,
      this.cashRegister
    ];

    audioElements.forEach(audio => {
      audio.pause();
      audio.muted = true;
    });

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // updateCounter = () => {
  //   if (this.state.counter < 100) {
  //     this.setState(prevState => ({ counter: prevState.counter + 1 }));
  //   }
  // };

  handleUnmute = () => {
    const audioElements = [
      this.audioWin,
      this.audioSplit,
      this.audioLose,
      this.fatality,
      this.nyan,
      this.topG,
      this.oohBaby,
      this.cashRegister
    ];

    audioElements.forEach(audio => {
      audio.muted = false;
    });
  };

  speak(message) {
    if (!this.props.isMuted && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.0; // set the speed to 1.0 (normal speed)
      utterance.lang = 'en-US'; // set the language to US English
      window.speechSynthesis.speak(utterance);
    }
  }

  handleClickMenu = e => {
    this.setState({ anchorEl: e.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  updateReminderTime = () => {
    this.setState({ transactions: updateFromNow(this.state.transactions) });
  };

  initSocket = () => {
    const socket = socketIOClient(this.state.endpoint);

    socket.on('CONNECTED', data => {
      socket.emit('STORE_CLIENT_USER_ID', { user_id: this.props.user._id });
      socket.emit('FETCH_GLOBAL_CHAT');
    });

    socket.on('UPDATED_ROOM_LIST', data => {
      this.props.setRoomList(data);
      this.props.getUser(true);
      this.props.getMyGames(1);
      this.props.getMyHistory();
      this.props.getHistory();
    });

    socket.on('PLAY_CORRECT_SOUND', socketId => {
      if (socket.id === socketId && !this.props.isMuted) {
        const audio = new Audio('/sounds/correct.mp3');
        audio.play();
      }
    });

    socket.on('PLAY_WRONG_SOUND', socketId => {
      if (socket.id === socketId && !this.props.isMuted) {
        const audio = new Audio('/sounds/wrong.mp3');
        audio.play();
      }
    });

    socket.on('SEND_CHAT', data => {
      try {
        if (!this.props.isMuted) {
          let winCounter = parseInt(localStorage.getItem('winCounter')) || 0;

          const message = data.message.toLowerCase();
          if (message.includes('won')) {
            let value;
            if (message.match(/\d+\.\d{2}/)) {
              value = message.match(/\d+\.\d{2}/)[0];
            } else if (message.match(/\d+/)) {
              value = message.match(/\d+/)[0];
            }
            if (value) {
              const formattedValue = parseFloat(value).toFixed(2);
              const spokenValue = formattedValue.endsWith('.00')
                ? parseFloat(formattedValue).toString()
                : formattedValue;
              this.speak(`Lost, ${spokenValue}`);
            }
            if (value >= 0 && value <= 2) {
              this.audioSplit.play();
            } else if (value > 25 && value <= 100) {
              this.audioLose.play();
            } else if (value > 100) {
              this.fatality.play();
            }
            winCounter = 0;
          } else if (message.includes('split')) {
            let value;
            if (message.match(/\d+\.\d{2}/)) {
              value = message.match(/\d+\.\d{2}/)[0];
            } else if (message.match(/\d+/)) {
              value = message.match(/\d+/)[0];
            }
            if (value) {
              const formattedValue = parseFloat(value).toFixed(2);
              const spokenValue = formattedValue.endsWith('.00')
                ? parseFloat(formattedValue).toString()
                : formattedValue;
              this.speak(`Split, ${spokenValue}`);
            }
            winCounter = 0;
          } else if (message.includes('lost')) {
            winCounter++;
            if (winCounter === 3) {
              this.oohBaby.play();
              winCounter = 0;
            }
            let value;
            if (message.match(/\d+\.\d{2}/)) {
              value = message.match(/\d+\.\d{2}/)[0];
            } else if (message.match(/\d+/)) {
              value = message.match(/\d+/)[0];
            }
            if (value) {
              const formattedValue = parseFloat(value).toFixed(2);
              const spokenValue = formattedValue.endsWith('.00')
                ? parseFloat(formattedValue).toString()
                : formattedValue;
              this.speak(`Won, ${spokenValue}`);
            }
            if (value >= 0 && value <= 2) {
              this.audioSplit.play();
            } else if (value >= 15 && value <= 50) {
              this.cashRegister.play();
            } else if (value > 50 && value <= 250) {
              this.audioWin.play();
            } else if (value > 250 && value <= 1000) {
              this.topG.play();
            } else if (value > 1000) {
              this.nyan.play();
            }
          }

          localStorage.setItem('winCounter', winCounter);
        }
        this.props.addChatLog(data);

        if (history.location.pathname.substr(0, 5) === '/chat') {
          socket.emit('READ_MESSAGE', {
            to: this.props.user._id,
            from: data.from
          });
        } else {
          socket.emit('REQUEST_UNREAD_MESSAGE_COUNT', {
            to: this.props.user._id
          });
        }
      } catch (e) {
        console.log(e);
      }
    });

    socket.on('UPDATE_BET_RESULT', data => {
      this.props.updateBetResult(data);
    });

    socket.on('NEW_TRANSACTION', data => {
      this.props.addNewTransaction(data);
    });

    socket.on('SET_UNREAD_MESSAGE_COUNT', data => {
      this.props.setUnreadMessageCount(data);
    });

    socket.on('ONLINE_STATUS_UPDATED', data => {
      this.props.updateOnlineUserList(data.user_list);
    });

    socket.on('GLOBAL_CHAT_RECEIVED', data => {
      this.props.globalChatReceived(data);
    });

    socket.on('SET_GLOBAL_CHAT', this.props.setGlobalChat);

    this.props.setSocket(socket);
  };
  loadWeb3 = async () => {
    try {
      const web3 = new Web3(Web3.givenProvider);
      this.setState({ web3 });
      const accounts = await web3.eth.requestAccounts();
      const contractInstance = new web3.eth.Contract(abi, tokenAddr);
      const tokenBalance = await contractInstance.methods
        .balanceOf(accounts[0])
        .call();
      const decimal = await contractInstance.methods.decimals().call();
      const tokenAmount =
        Math.floor(Number(tokenBalance / Math.pow(10, decimal)) * 100000) /
        100000;
      this.setState({ web3account: accounts[0] });
      this.setState({ web3balance: tokenAmount });
    } catch (e) {
      console.log(e);
    }
  };
  async componentDidMount() {
    let currentUrl = window.location.pathname;

    if (currentUrl.indexOf('create') !== -1) {
      this.setState({
        selectedMainTabIndex: this.props.selectMainTab(1)
      });
    }
    // this.counter = setInterval(this.updateCounter, 25);
    setTimeout(() => {
      this.setState({ websiteLoading: false });
    }, 1500);

    this.initializeAudio();

    this.initSocket();

    const result = await this.props.getUser(true);

    if (result.status === 'success') {
      // if (!result.user.is_activated) {
      //   this.handleOpenVerificationModal();
      // }
    }

    this.interval = setInterval(this.updateReminderTime, 3000);

    //web3
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        this.loadWeb3();
      });
      window.ethereum.on('accountsChanged', () => {
        this.loadWeb3();
      });
    }

    this.loadWeb3();
    this.fetchData();
    setInterval(() => this.fetchData(), 2000); // Call the fetchData method every 2 seconds
  }

  initializeAudio() {
    try {
      this.nyan = new Audio('/sounds/nyan.mp3');
      this.nyan.load();
      this.topG = new Audio('/sounds/topG.mp3');
      this.topG.load();
      this.oohBaby = new Audio('/sounds/ooh-baby.mp3');
      this.oohBaby.load();
      this.cashRegister = new Audio('/sounds/cash-register.mp3');
      this.cashRegister.load();
      this.fatality = new Audio('/sounds/fatality.mp3');
      this.fatality.load();
      this.audioWin = new Audio('/sounds/audioWin.mp3');
      this.audioWin.load();
      this.audioSplit = new Audio('/sounds/audioSplit.mp3');
      this.audioSplit.load();
      this.audioLose = new Audio('/sounds/audioLose.mp3');
      this.audioLose.load();
    } catch (e) {
      console.log(e);
    }
  }
  async fetchData() {
    const { transactions } = this.props;

    const categories = [];
    const data = [];
    let currentBalance = 0;

    transactions.forEach((transaction, index) => {
      categories.push(transaction.created_at);
      currentBalance += transaction.amount;
      data.push({
        x: index,
        y: currentBalance,
        color: transaction.amount >= 0 ? 'green' : 'red'
      });
    });

    this.setState(prevState => ({
      balance: currentBalance,
      oldBalance: prevState.balance
    }));

    this.setState({
      options: {
        chart: {
          id: 'balance-chart',
          toolbar: {
            show: false
          },
          markers: {
            size: 0
          },
          grid: {
            show: false
          },
          tooltip: {
            enabled: false
          }
        },
        xaxis: {
          categories
        },
        yaxis: {
          opposite: true
        },
        interactions: []
      },
      series: [
        {
          data
        }
      ]
    });
  }

  componentWillUnmount() {
    const { socket } = this.props;
    if (socket) {
      socket.disconnect();
    }
    clearInterval(this.interval);
    clearInterval(this.timer);
    // clearInterval(this.counter);
  }
  handleLogout = clear_token => {
    this.setState({
      web3account: null,
      web3balance: null,
      anchorEl: null,
      showGameLog: false
    });

    const { socket, userSignOut } = this.props;
    if (socket) {
      socket.disconnect();
    }
    userSignOut(clear_token);
  };

  handleOpenLoginModal = () => {
    this.setState({ showLoginModal: true });
  };
  handleCloseLoginModal = () => {
    this.setState({ showLoginModal: false });
  };

  handleOpenSignupModal = () => {
    this.setState({ showSignupModal: true });
  };
  handleCloseSignupModal = () => {
    this.setState({ showSignupModal: false });
  };

  handleOpenVerificationModal = () => {
    this.setState({ showVerificationModal: true });
  };
  handleCloseVerificationModal = () => {
    this.setState({ showVerificationModal: false });
  };

  handleOpenProfileModal = () => {
    this.setState({ showProfileModal: true, anchorEl: null });
  };
  handleCloseProfileModal = () => {
    this.setState({ showProfileModal: false });
  };
  handleOpenPlayerModal = () => {
    this.setState({ showPlayerModal: true, anchorEl: null });
  };
  handleClosePlayerModal = () => {
    this.setState({ showPlayerModal: false });
  };

  handleOpenHowToPlayModal = () => {
    this.setState({ showHowToPlayModal: true });
  };
  handleCloseHowToPlayModal = () => {
    this.setState({ showHowToPlayModal: false });
  };

  handleOpenDepositModal = () => {
    this.setState({ showDepositModal: true, anchorEl: null });
  };
  handleCloseDepositModal = () => {
    this.setState({ showDepositModal: false });
  };

  handleOpenWithdrawModal = () => {
    this.setState({ showWithdrawModal: true, anchorEl: null });
  };
  handleCloseWithdrawModal = () => {
    this.setState({ showWithdrawModal: false });
  };

  handleOpenResetPasswordModal = () => {
    this.setState({ showResetPasswordModal: true });
  };
  handleCloseResetPasswordModal = () => {
    this.setState({ showResetPasswordModal: false });
  };

  handleBalanceClick = () => {
    this.setState({ showGameLog: !this.state.showGameLog });
  };

  disconnectWeb3 = async () => {
    this.setState({
      web3account: null,
      web3balance: null
    });
  };

  render() {
    const { isMuted, balance, oldBalance } = this.state;
    const { websiteLoading } = this.state;

    return (
      <MuiThemeProvider theme={this.props.isDarkMode ? darkTheme : mainTheme}>
        <div
          className={`site_wrapper row ${
            this.props.isDarkMode ? 'dark_mode' : ''
          }`}
        >
          {websiteLoading && (
            <div
              className="loading-overlay"
              style={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <img src={randomGifUrl} alt="Loading" />
              <span
                style={{
                  marginTop: '10px',
                  color: '#fff'
                }}
              >
          {`Connecting...`}
              </span>
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: progress
                }}
                style={{
                  marginTop: '-40px',
                  filter: `hue-rotate(${hueRotateValue}deg)`, // Use the calculated hue-rotate value
                  width: '300px',
                  height: '100px'
                }}
              />
            </div>
          )}
          <div className="game_header">
            <div className="main_header">
              <a
                className="game_logo"
                href="#"
                onClick={e => {
                  history.push('/');
                }}
              >
                {' '}
              </a>
              <Tabs
                value={this.props.selectedMainTabIndex}
                onChange={this.handleMainTabChange}
                TabIndicatorProps={{ style: { background: '#ff0000' } }}
                className="main-game-page-tabs desktop-only"
              >
                <Tab
  className={`custom-tab ${
    this.state.hoverTabIndex === 0 || this.props.selectedMainTabIndex === 0
      ? 'fade-animation fade-in'
      : 'fade-animation fade-out'
  }`}
  label="PVP"
  labelPlacement="left"
  icon={
    this.state.hoverTabIndex === 0 || this.props.selectedMainTabIndex === 0 ? (
      <BattleHover />
    ) : (
      <Battle />
    )
  }
  style={customStyles.tabRoot}
  onMouseEnter={() => this.handleMouseEnter(0)}
  onMouseLeave={this.handleMouseLeave}
/>

<Tab
  className={`custom-tab ${
    this.state.hoverTabIndex === 1 || this.props.selectedMainTabIndex === 1
      ? 'fade-animation fade-in'
      : 'fade-animation fade-out'
  }`}
  label="Manage"
  labelPlacement="left"
  icon={
    this.state.hoverTabIndex === 1 || this.props.selectedMainTabIndex === 1 ? (
      <ManageHover />
    ) : (
      <Manage />
    )
  }
  style={customStyles.tabRoot}
  onMouseEnter={() => this.handleMouseEnter(1)}
  onMouseLeave={this.handleMouseLeave}
/>

              </Tabs>

              <div className="header_action_panel">
                <div></div>
                {
                  /*<a
                  href="#"
                  onClick={e => {
                    history.push('/leaderboards');
                  }}
                  id="btn_leaderboards"
                >
                  <img src="/img/icons/leaderboards.svg" alt="Leaderboards" />
                  Leaderboards
                </a>
                */
                  <a
                    onClick={this.handleOpenHowToPlayModal}
                    id="btn_how_to_play"
                    onMouseEnter={() => this.handleMouseEnter(2)}
                    onMouseLeave={this.handleMouseLeave}
                  >
                    {this.state.hoverTabIndex === 2 ? (
                      <HowToHover />
                    ) : (
                      <HowTo />
                    )}
                  </a>
                }
                {this.props.isAuthenticated ? (
                  <>
                    <div id="balance">
                      <CountUp
                        start={oldBalance}
                        end={balance}
                        prefix="$"
                        separator=","
                        decimal="."
                        decimals={2}
                        duration={1.5}
                        redraw={true}
                        preserveValue={true}
                        onEnd={() => {
                          this.setState({ oldBalance: balance }); // update oldBalance after animation completes
                        }}
                      />
                      <Button
                      id="wallet-btn"
                        style={{ minWidth: '32px', maxHeight: '33px', borderRadius: '0.25em' }}
                        onClick={this.handleBalanceClick}
                      >
                        <AccountBalanceWallet
                          style={{ position: 'relative', zIndex: '1', width: '18px', height: '18px', margin: '0 5px 0 10px' }}
                        /><span id="wallet-text" style={{position: 'relative', zIndex: '1', fontSize: '0.6em', paddingRight: '10px'}} >Wallet</span>
                      </Button>
                    </div>

                    <Button
                      area-constrols="profile-menu"
                      aria-haspopup="true"
                      onClick={this.handleClickMenu}
                      className="profile-menu"
                    >
                      <Avatar
                        src={this.props.user.avatar}
                        alt=""
                        className="avatar"
                        darkMode={this.props.isDarkMode}
                      />
                      {/* <span className="username">{this.state.userName}</span> */}
                      <ArrowDropDownIcon />
                    </Button>
                    <Menu
                      id="profile-menu"
                      anchorEl={this.state.anchorEl}
                      getContentAnchorEl={null}
                      open={Boolean(this.state.anchorEl)}
                      onClose={this.handleCloseMenu}
                      isDarkMode={this.props.isDarkMode}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center'
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                      }}
                      PaperProps={{
                        style: {
                          width: '200px',
                          border: this.props.isDarkMode ?
                          '2px solid #212529'
                          : '2px solid #e5e5e5',
                          background: this.props.isDarkMode
                            ? '#101010'
                            : '#f9f9f9'
                        }
                      }}
                    >
                      <MenuItem onClick={this.handleOpenProfileModal}>
                        <ListItemIcon>
                          <PersonOutlineIcon />
                        </ListItemIcon>
                        <ListItemText>PROFILE</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={this.playPause}>
                        <ReactApexChart
                          options={{
                            chart: {
                              animations: {
                                enabled: false
                              },
                              toolbar: {
                                show: false
                              },
                              events: {},
                              zoom: {
                                enabled: false
                              }
                            },
                            grid: {
                              show: false
                            },
                            tooltip: {
                              enabled: false
                            },
                            fill: {
                              type: 'gradient',
                              gradient: {
                                shade: 'light',
                                gradientToColors: ['#8F7CC3'],
                                shadeIntensity: 1,
                                type: 'vertical',
                                opacityFrom: 0.7,
                                opacityTo: 0.9,
                                stops: [0, 100, 100]
                              }
                            },
                            stroke: {
                              curve: 'smooth'
                            },
                            xaxis: {
                              labels: {
                                show: false
                              },
                              axisTicks: {
                                show: false
                              },
                              axisBorder: {
                                show: false
                              }
                            },
                            yaxis: {
                              labels: {
                                show: false
                              },
                              axisTicks: {
                                show: false
                              },
                              axisBorder: {
                                show: false
                              }
                            }
                          }}
                          series={this.state.series}
                          type="line"
                          height="80"
                        />
                      </MenuItem>
                      <Divider />

                      <MenuItem>
                        <ListItemText>
                          {this.props.isMuted ? (
                            <div
                              className="playBtn"
                              onClick={e => {
                                this.props.toggleMute(!this.props.isMuted);
                                this.handleMute();
                              }}
                            >
                              <ListItemIcon>
                                <VolumeOffIcon />
                              </ListItemIcon>
                              UNMUTE
                            </div>
                          ) : (
                            <div
                              className="playBtn"
                              onClick={e => {
                                this.props.toggleMute(!this.props.isMuted);
                                this.handleUnmute();
                              }}
                            >
                              <ListItemIcon>
                                <VolumeUpIcon />
                              </ListItemIcon>
                              MUTE
                            </div>
                          )}
                        </ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={e => {
                          this.props.setDarkMode(!this.props.isDarkMode);
                        }}
                      >
                        <ListItemIcon>
                          {this.props.isDarkMode ? (
                            <Brightness7Icon />
                          ) : (
                            <Brightness4Icon />
                          )}
                        </ListItemIcon>
                        <ListItemText>
                          {this.props.isDarkMode ? 'LIGHT MODE' : 'DARK MODE'}
                        </ListItemText>
                      </MenuItem>
                      <Divider />
                      <MenuItem
                        onClick={e => {
                          this.handleLogout(true);
                        }}
                      >
                        <ListItemIcon>
                          <ExitToAppIcon size="small" />
                        </ListItemIcon>
                        <ListItemText>LOG OUT</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button id="btn-login" onClick={this.handleOpenLoginModal}>
                      Login
                    </Button>
                    {/* <Button
                      id="btn-signup"
                      onClick={this.handleOpenSignupModal}
                    >
                      Register
                    </Button> */}
                  </>
                )}
              </div>
            </div>
            <div
              id="game_logs"
              className={this.state.showGameLog ? '' : 'hidden'}
              onClick={this.handleBalanceClick}
            >
              <div className="arrow-up"></div>
              <div className="game_logs_contents">
                {<h2>BALANCE HISTORY</h2>}
                {
                  <table>
                    <tbody>
                      {this.state.transactions.length === 0 ? (
                        <tr>
                          <td>...</td>
                        </tr>
                      ) : (
                        this.state.transactions.map((row, key) => (
                          <tr key={key}>
                            <td
                              className={
                                'amount ' + (row.amount > 0 ? 'green' : 'red')
                              }
                            >
                              {row.amount > 0 ? (
                                <>
                                  {'+ '}
                                  {convertToCurrency(
                                    updateDigitToPoint2(row.amount)
                                  )}
                                </>
                              ) : (
                                <>
                                  {'- '}
                                  {convertToCurrency(
                                    updateDigitToPoint2(Math.abs(row.amount))
                                  )}
                                </>
                              )}
                            </td>
                            <td className="fromNow">{row.from_now}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                }
                <div className="transaction-panel">
                  <Button
                    className="btn-withdraw"
                    onClick={this.handleOpenWithdrawModal}
                    isDarkMode={this.props.isDarkMode}
                  >
                    Withdraw
                  </Button>
                  <Button
                    className="btn-deposit"
                    onClick={this.handleOpenDepositModal}
                    isDarkMode={this.props.isDarkMode}
                  >
                    Deposit
                  </Button>
                  <hr />
                  {this.state.web3account ? (
                    <>
                      <input
                        id="wallet-address"
                        type="text"
                        value={this.state.web3account}
                        readOnly
                      />
                      <Button className="connect" onClick={this.disconnectWeb3}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button className="connect" onClick={this.loadWeb3}>
                      Wallet Not connected
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="game_wrapper">
            <div className="contents_wrapper">{this.props.children}</div>
          </div>

          {this.state.showProfileModal && (
            <ProfileModal
              modalIsOpen={this.state.showProfileModal}
              closeModal={this.handleCloseProfileModal}
              player_name={this.state.userName}
              balance={this.state.balance}
              avatar={this.props.user.avatar}
              email={this.props.user.email}
            />
          )}
          {this.state.showPlayerModal && (
            <PlayerModal
              modalIsOpen={this.state.showPlayerModal}
              closeModal={this.handleClosePlayerModal}
              player_name={this.state.userName}
              balance={this.state.balance}
              avatar={this.props.user.avatar}
            />
          )}
          {this.state.showHowToPlayModal && (
            <HowToPlayModal
              modalIsOpen={this.state.showHowToPlayModal}
              closeModal={this.handleCloseHowToPlayModal}
              player_name={this.state.userName}
              balance={this.state.balance}
              isDarkMode={this.props.isDarkMode}
            />
          )}
          {this.state.showLoginModal && (
            <LoginModal
              modalIsOpen={this.state.showLoginModal}
              closeModal={this.handleCloseLoginModal}
              openSignupModal={this.handleOpenSignupModal}
              openVerificationModal={this.handleOpenVerificationModal}
              initSocket={this.initSocket}
              openResetPasswordModal={this.handleOpenResetPasswordModal}
            />
          )}
          {this.state.showSignupModal && (
            <SignupModal
              modalIsOpen={this.state.showSignupModal}
              closeModal={this.handleCloseSignupModal}
              openLoginModal={this.handleOpenLoginModal}
            />
          )}
          {this.state.showVerificationModal && (
            <VerificationModal
              modalIsOpen={this.state.showVerificationModal}
              closeModal={this.handleCloseVerificationModal}
            />
          )}
          {this.state.showDepositModal && (
            <DepositModal
              modalIsOpen={this.state.showDepositModal}
              closeModal={this.handleCloseDepositModal}
              web3={this.state.web3}
              balance={this.state.web3balance}
              account={this.state.web3account}
            />
          )}
          {this.state.showWithdrawModal && (
            <WithdrawModal
              modalIsOpen={this.state.showWithdrawModal}
              closeModal={this.handleCloseWithdrawModal}
              balance={this.state.balance}
              web3={this.state.web3}
              account={this.state.web3account}
            />
          )}
          {this.state.showResetPasswordModal && (
            <ResetPasswordModal
              modalIsOpen={this.state.showResetPasswordModal}
              closeModal={this.handleCloseResetPasswordModal}
              openLoginModal={this.handleOpenLoginModal}
            />
          )}
          <GamePasswordModal />
        </div>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  showGamePasswordModal: state.snackbar.showGamePasswordModal,
  socket: state.auth.socket,
  balance: state.auth.balance,
  userName: state.auth.userName,
  isMuted: state.auth.isMuted,
  user: state.auth.user,
  unreadMessageCount: state.auth.unreadMessageCount,
  // isActiveLoadingOverlay: state.logic.isActiveLoadingOverlay,
  selectedMainTabIndex: state.logic.selectedMainTabIndex,
  transactions: state.auth.transactions,
  isDarkMode: state.auth.isDarkMode,
  betResult: state.logic.betResult
});

const mapDispatchToProps = {
  setSocket,
  userSignOut,
  setRoomList,
  getUser,
  addChatLog,
  getMyGames,
  getMyHistory,
  getHistory,
  setUnreadMessageCount,
  addNewTransaction,
  setDarkMode,
  updateOnlineUserList,
  selectMainTab,
  globalChatReceived,
  toggleMute,
  setGlobalChat,
  updateBetResult
};

export default connect(mapStateToProps, mapDispatchToProps)(SiteWrapper);
