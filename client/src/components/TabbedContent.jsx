import React, { Component } from 'react';
import { Tabs, Tab, Button, Typography, Box } from '@material-ui/core';
import ShowHistory from '../game_panel/icons/ShowHistory';
import ShowHistoryHover from '../game_panel/icons/ShowHistoryHover';
import ChatHover from '../game_panel/icons/ChatHover';
import ChatRoomHover from '../game_panel/icons/ChatRoomHover';
import Leaderboards from '../game_panel/main_pages/Leaderboards';



class TabbedContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 0,
      numToShow: 10,
    };
    this.handleLoadMore = this.handleLoadMore.bind(this);
  }

  handleLoadMore() {
    this.setState({
      numToShow: this.state.numToShow + 10
    });
  }
  handleTabChange = (event, newValue) => {
    this.setState({ selectedTab: newValue });
  };

  render() {
    const { selectedTab } = this.state;

    return (
      <div>
        <Tabs
                        TabIndicatorProps={{ style: { background: '#ff0000' } }}

        value={selectedTab}
        onChange={this.handleTabChange}
        >
          <Tab
          //  icon={
          //   this.state.selectedTab === 0 ? (
          //     <ShowHistoryHover />
          //   ) : (
          //     <ShowHistory />
          //   )
          // }
          label="History" 
          />
          <Tab
            label="Chat" 
          
          />
          <Tab label="Leaderboards" />
          <Tab label="Players" />
        </Tabs>
        <div>
          {selectedTab === 0 && (
            <div className="room-history-panel">
            <h2 className="room-history-title">Battle History</h2>
            {this.props.roomInfo &&
            this.props.roomInfo.room_history &&
            this.props.roomInfo.room_history.length > 0 ? (
              <div className="table main-history-table">
                {this.props.roomInfo.room_history
                  .slice(0, this.state.numToShow)
                  .map((row, key) => (
                    <div className="table-row" key={'history' + row._id}>
                      <div>
                        <div className="table-cell">
                          <div className="room-id">{row.room_name}</div>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: row.history
                            }}
                          ></div>
                          <div className="table-cell">{row.from_now}</div>
                        </div>
                      </div>
                      {key === this.props.roomInfo.room_history.length - 1 && (
                        <div ref={this.lastItemRef}></div>
                      )}
                    </div>
                  ))}
                {this.state.numToShow < this.props.roomInfo.room_history.length && (
                  <div className="load-more-btn">
                    <Button
                      id="load-btn"
                      variant="contained"
                      color="primary"
                      onClick={this.handleLoadMore}
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p>No History Yet</p>
            )}
          </div>
          )}
          {selectedTab === 1 && (
            <div>
              COMING SOON
              {/* Render Comments component */}
            </div>
          )}
          {selectedTab === 2 && (
            <div>
              COMING SOON
              <Leaderboards />
            </div>
          )}
          {selectedTab === 3 && (
            <div>
              COMING SOON
              {/* Render Players Online component */}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default TabbedContent;
