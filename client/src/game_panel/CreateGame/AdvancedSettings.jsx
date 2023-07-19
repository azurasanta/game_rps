import React, { Component } from 'react';
import { Button, TextField } from '@material-ui/core';
class AdvancedSettings extends Component {
  render() {
    return (
      <div id="advanced_panel">
        {this.props.step === 1 && (
          <div className="game-privacy-panel game-info-panel">
            <h3 className="game-sub-title">Privacy</h3>
            <div className="radio-button-group bet-amounts">
              <Button
                className={!this.props.is_private ? ' active' : ''}
                onClick={() => {
                  this.props.onChangeState({
                    is_private: false,
                    room_password: ''
                  });
                }}
              >
                Public
              </Button>
              <Button
                className={this.props.is_private ? ' active' : ''}
                onClick={() => {
                  this.props.onChangeState({ is_private: true });
                }}
              >
                Private
              </Button>
              <TextField
                type="text"
                id="betamount"
                variant="outlined"
                InputLabelProps={{
                  shrink: true
                }}
                value={this.props.room_password}
                onChange={e => {
                  this.props.onChangeState({ room_password: e.target.value });
                }}
                className={this.props.is_private === true ? '' : ' hidden'}
              />
            </div>
            <p>Set to 'Private' to require a password to Join</p>
          </div>
        )}

        {this.props.step === 2 && (
          <div className="game-info-panel payout-info-panel">
            <h3 className="game-sub-title">Payout</h3>
            <div className="select-buttons-panel bet-amounts">
              <Button
                className={!this.props.endgame_type ? ' active' : ''}
                onClick={() => {
                  this.props.onChangeState({ endgame_type: false });
                }}
              >
                Manual
              </Button>
              <Button
                className={this.props.endgame_type ? ' active' : ''}
                onClick={() => {
                  this.props.onChangeState({ endgame_type: true });
                }}
              >
                Automatic
              </Button>
              <div
                className={`edit-amount-panel ${
                  this.props.endgame_type ? '' : 'hidden'
                }`}
              >
                <TextField
                  type="text"
                  variant="outlined"
                  name="endgame_amount"
                  id="endgame_amount"
                  value={this.props.endgame_amount}
                  inputProps={{
                    pattern: '[0-9]*',
                    maxLength: 9
                  }}
                  InputLabelProps={{
                    shrink: true
                  }}
                  InputProps={{
                    endAdornment: 'BUSD'
                  }}
                  onChange={e => {
                    if (this.props.game_mode === 'Mystery Box') {
                      this.props.onChangeState({
                        endgame_amount: e.target.value,
                        winChance: this.props.calcMysteryBoxEV(
                          this.props.box_list,
                          e.target.value,
                          this.props.max_return
                        )
                      });
                    } else if (this.props.game_mode === 'Spleesh!') {
                      this.props.onChangeState({
                        endgame_amount: e.target.value,
                        winChance: this.props.calculateEV(
                          this.props.bet_amount,
                          e.target.value,
                          this.props.spleesh_bet_unit
                        )
                      });
                    } else {
                      this.props.onChangeState({
                        endgame_amount: e.target.value
                      });
                    }
                    // this.calcWinChance(this.state.boxList, e.target.value);
                  }}
                  placeholder="PAYOUT"
                />
              </div>
            </div>
            <p className="tip">AUTOMATIC PAYOUTS WHEN BANKROLL HITS VALUE</p>
          </div>
        )}
        {/* {this.props.step === 3 && (
          <div className="game-privacy-panel game-info-panel">
            <h3 className="game-sub-title">AI Play Algorithm</h3>
            <div className="radio-button-group">
              <button
                className={
                  'radio-button' + (this.props.is_anonymous === true ? ' checked' : '')
                }
                onClick={() => { this.props.onChangeState({is_anonymous: true}); }}
              >
                V1
              </button>
              <button
                className={
                  'radio-button' + (this.props.is_anonymous === false ? ' checked' : '')
                }
                onClick={() => { this.props.onChangeState({is_anonymous: false}); }}
              >
                V2
              </button>
            </div>
            <p>Click 'i' for more info.</p>
          </div>
        )} */}
        {this.props.step === 3 && (
          <div className="game-music-panel game-info-panel">
            <h3 className="game-sub-title">Add music?</h3>
            <form onSubmit={this.props.handleSubmit}>
              <TextField
                label="YouTube URL"
                variant="outlined"
                value={this.props.youtubeUrl}
                onChange={this.props.handleUrlChange}
              />
              <Button type="submit" variant="contained" color="primary">
                Play
              </Button>
            </form>
            {this.props.isPlaying && (
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${this.props.videoId}?autoplay=1`}
                title="YouTube Music Player"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            )}
            <p className="tip">ENTER A YOUTUBE URL AND CLICK PLAY</p>
          </div>
        )}
        {/* {this.props.step === 3 && (
          <div className="game-privacy-panel game-info-panel">
            <h3 className="game-sub-title">Anonymous</h3>
            <div className="radio-button-group">
              <button
                className={
                  'radio-button' + (this.props.is_anonymous === true ? ' checked' : '')
                }
                onClick={() => { this.props.onChangeState({is_anonymous: true}); }}
              >
                Yes
              </button>
              <button
                className={
                  'radio-button' + (this.props.is_anonymous === false ? ' checked' : '')
                }
                onClick={() => { this.props.onChangeState({is_anonymous: false}); }}
              >
                No
              </button>
            </div>
            <p>Choose 'Yes' to place an anonymous bet. RPS 0.10 will be deducted from your balance and added to the PR. Please note, if you end your game, you will not receive your RPS 0.10 back.</p>
          </div>
        )} */}

        {/* 
        <hr/>
				<label className="lbl_game_option">Anonymous Bet</label>
				<div >
					<label className={"radio-inline" + (this.props.is_anonymous === true ? ' checked' : '')} onClick={() => { this.props.onChangeState({is_anonymous: true}); }}>Yes</label>
					<label className={"radio-inline" + (this.props.is_anonymous === false ? ' checked' : '')} onClick={() => { this.props.onChangeState({is_anonymous: false}); }}>No</label>
				</div>
				<div className="tip" style={{pointerEvents: "none", opacity: "0.6"}}>Choose 'Yes' to place an anonymous bet. RPS 0.10 will be deducted from your balance and added to the PR. Please note, if you end your game, you will not receive your RPS 0.10 back.</div>
      */}
      </div>
    );
  }
}

export default AdvancedSettings;
