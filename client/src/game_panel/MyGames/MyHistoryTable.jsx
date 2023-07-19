import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getMyHistory } from '../../redux/Logic/logic.actions';
import IconButton from '@material-ui/core/IconButton';
import {Box, Button} from '@material-ui/core';
import Moment from 'moment';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Pagination from '../../components/Pagination';
import PlayerModal from '../modal/PlayerModal';
import Lottie from 'react-lottie';
import rain from '../LottieAnimations/rain.json';
import waves from '../LottieAnimations/waves.json';
import hex from '../LottieAnimations/hex.json';

function updateFromNow(history = []) {
  const result = JSON.parse(JSON.stringify(history));
  for (let i = 0; i < result.length; i++) {
    result[i]['from_now'] = Moment(result[i]['created_at']).fromNow();
  }
  return result;
}

class MyHistoryTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myHistory: this.props.myHistory,
      selectedGameType: 'All',
      showPlayerModal: false,

    };
  }

  static getDerivedStateFromProps(props, current_state) {
    if (
      (current_state.myHistory && current_state.myHistory.length === 0) ||
      (current_state.myHistory &&
        current_state.myHistory.length !== props.myHistory?.length) ||
      (props.myHistory &&
        current_state.myHistory &&
        current_state.myHistory[0]['created_at'] !==
          props.myHistory[0]['created_at'])
    ) {
      return {
        ...current_state,
        myHistory: updateFromNow(props.myHistory)
      };
    }
    return null;
  }

  updateReminderTime = () => {
    this.setState({ myHistory: updateFromNow(this.state.myHistory) });
  };

  async componentDidMount() {
    this.updateReminderTime();
    this.attachUserLinkListeners();

    this.interval = setInterval(this.updateReminderTime(), 3000);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.history !== this.props.history) {
      this.attachUserLinkListeners();

        this.setState({ history: updateFromNow(this.props.history) });
    }
}

  attachUserLinkListeners = () => {
    const userLinks = document.querySelectorAll('.user-link');
    userLinks.forEach(link => {
      link.addEventListener('click', event => {
        const userId = event.target.getAttribute('data-userid');
        this.handleOpenPlayerModal(userId);
      });
    });
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  // handleGameTypeButtonClicked = async short_name => {
  //   this.setState({ selectedGameType: short_name });
  //   this.props.getMyHistory({
  //     game_type: short_name
  //   });
  // };

  handleOpenPlayerModal = (creator_id) => {
    this.setState({ showPlayerModal: true, selectedCreator: creator_id });
  }

  
  handleClosePlayerModal = () => {
    this.setState({ showPlayerModal: false });
  };
  
//   handleBtnLeftClicked = e => {
//     const scrollAmount = 200; // Change this value to adjust the scroll amount
//     this.game_type_panel.scrollLeft -= scrollAmount;
//   };

//   handleBtnRightClicked = e => {
//     const scrollAmount = 200; // Change this value to adjust the scroll amount
//     this.game_type_panel.scrollLeft += scrollAmount;
//   };

//   generateGameTypePanel = () => {
//     const gameTypeStyleClass = {
//       RPS: 'rps',
//       'S!': 'spleesh',
//       MB: 'mystery-box',
//       BG: 'brain-game',
//       QS: 'quick-shoot',
//       DG: 'drop-game',
//       'B!': 'bang',
//       R: 'roll'
//     };

//     const gameTypePanel = (
//       <Box display="flex" justifyContent="space-evenly" flexWrap="nowrap"  gap="15px">
//         <Box key="open-game-left-button">
//           <IconButton
//             className="btn-arrow-left"
//             onClick={this.handleBtnLeftClicked}
//           >
//             <ChevronLeftIcon />
//           </IconButton>
//         </Box>
//         <Button
//   className={`btn-game-type btn-icon all-games ${
//     this.state.selectedGameType === 'All' ? 'active' : ''
//   }`}
//   key="open-game-all-game-button"
//   onClick={() => {
//     this.handleGameTypeButtonClicked('All');
//   }}
// >
//   All Games
// </Button>
// {this.props.gameTypeList.map((gameType, index) => (
//   <Button
//     className={`btn-game-type btn-icon ${
//       gameTypeStyleClass[gameType.short_name]
//     } ${
//       this.state.selectedGameType === gameType.short_name ? 'active' : ''
//     }`}
//     key={index}
//     onClick={() => {
//       this.handleGameTypeButtonClicked(gameType.short_name);
//     }}
//   >
//     {gameType.game_type_name}
//   </Button>
//         ))}
//         <Box key="open-game-right-button">
//           <IconButton
//             className="btn-arrow-right"
//             onClick={this.handleBtnRightClicked}
//           >
//             <ChevronRightIcon />
//           </IconButton>
//         </Box>
//       </Box>
//     );
    
//     return gameTypePanel;
  
//   };


  handlePageNumberClicked = page => {
    this.props.getMyHistory({
      page: page,
      // game_type: this.state.selectedGameType
    });
  };

  handlePrevPageClicked = () => {
    if (this.props.pageNumber === 1) return;
    this.props.getMyHistory({
      page: this.props.pageNumber - 1,
      game_type: this.state.selectedGameType
    });
  };

  handleNextPageClicked = () => {
    if (this.props.pageNumber === this.props.totalPage) return;
    this.props.getMyHistory({
      page: this.props.pageNumber + 1,
      game_type: this.state.selectedGameType
    });
  };

  render() {
    // const gameTypePanel = this.generateGameTypePanel();

    return (
      <div className="overflowX">
        {/* <div className="outer-div"> */}
      <div className="border-mask" />
      {/* <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: rain
              }}
              style={{
  transform: 'translateY(-66px)',
  width: '250px',
  height: '100%',
  overflow: 'hidden',
  margin: '-2px 0px -187px',
  outline: 'none',
  filter: 'hue-rotate(2deg)',
  maxWidth: '100%'
              }}
            />
            <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: hex
              }}
              style={{
                transform: 'translateY(-66px)',
                width: '142px',
                height: '100%',
                overflow: 'hidden',
                margin: '-2px 0px -187px',
                outline: 'none',
                filter: 'hue-rotate(2deg)',
                maxWidth: '100%'
              }}
            />
             <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: waves
              }}
              style={{
                transform: 'translateY(-66px)',
                width: '361px',
                height: '100%',
                overflow: 'hidden',
                margin: '60px 0px -236px',
                outline: 'none',
                filter: 'hue-rotate(48deg)',
                maxWidth: '100%'
              }}
            />
            
        <h1
        id="rain"
        style={{
          color: '#fff',
          fontSize: '3.1em',
          letterSpacing: '0.35em',
          textShadow: '0 0 12px #0058b6'
        }}
        >RAIN</h1>
        <p
        
        style={{
          color: '#fff',
          paddingLeft: '10px',
          textShadow: '0 0 12px #0058b6'
        }}
        >Coming Soon!</p>
    </div> */}
        {/* <div className="game-type-container">
          <div
            className="game-type-panel"
            ref={elem => {
              this.game_type_panel = elem;
            }}
          >
            {gameTypePanel}
          </div>
        </div> */}
        <div className="table main-history-table">
          {this.state.myHistory?.length === 0 && (
            <div className="dont-have-game-msg">
              <div>NO BATTLE HISTORY RIGHT NOW</div>
            </div>
          )}
          {this.state.myHistory?.map(
            (row, key) => (
              <div className="table-row" key={'my_history' + row._id}>
                <div>
                  <div className="table-cell">
                    <div className="room-id">{row.room_name}</div>
                    <div
                      className="desktop-only"
                      dangerouslySetInnerHTML={{ __html: row.history }}
                    ></div>
                  </div>
                  <div className="table-cell">{row.from_now}</div>
                </div>
                <div>
                  <div
                    className="table-cell mobile-only"
                    dangerouslySetInnerHTML={{ __html: row.history }}
                  ></div>
                </div>
              </div>
            ),
            this
          )}
        </div>
        {this.state.showPlayerModal && (
            <PlayerModal
              modalIsOpen={this.state.showPlayerModal}
              closeModal={this.handleClosePlayerModal}
              selectedCreator={this.state.selectedCreator}
            // player_name={this.state.userName}
            // balance={this.state.balance}
            // avatar={this.props.user.avatar}
            />
          )}  
        {this.state.myHistory?.length > 0 && (
          <Pagination
            handlePageNumberClicked={this.handlePageNumberClicked}
            handlePrevPageClicked={this.handlePrevPageClicked}
            handleNextPageClicked={this.handleNextPageClicked}
            pageNumber={this.props.pageNumber}
            totalPage={this.props.totalPage}
            prefix="MyHistory"
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  myHistory: state.logic.myHistory,
  pageNumber: state.logic.myHistoryPageNumber,
  totalPage: state.logic.myHistoryTotalPage,
  // gameTypeList: state.logic.gameTypeList
});

const mapDispatchToProps = {
  getMyHistory
};

export default connect(mapStateToProps, mapDispatchToProps)(MyHistoryTable);
