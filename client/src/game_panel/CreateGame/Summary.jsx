import React, { Component } from 'react';
import { convertToCurrency } from '../../util/conversion';
import { updateDigitToPoint2 } from '../../util/helper';

class Summary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      winChance: 0,
      aveMultiplier: 0,
      public_bet_amount: 0
    };
    if (this.props.game_mode === 'RPS') {
      this.state.winChance = 33;
    } else if (this.props.game_mode === 'Spleesh!') {
      this.state.winChance = 69;
    } else if (this.props.game_mode === 'Mystery Box') {
      this.state.winChance = 10;
    } else if (this.props.game_mode === 'Quick Shoot') {
      this.state.winChance = 15;
    } else if (this.props.game_mode === 'Brain Game') {
      this.state.winChance = '0 - 100';
    } else if (this.props.game_mode === 'Drop Game') {
      this.state.winChance = 42;
    } else if (this.props.game_mode === 'Bang!') {
      this.state.winChance = 42;
    } else if (this.props.game_mode === 'Roll') {
      this.state.winChance = 42;
    } else if (this.props.game_mode === 'Blackjack') {
      this.state.winChance = 42;
    }
  }
  pre_summery() {
    // console.log({ props: this.props });
    let public_max_return = convertToCurrency(
      updateDigitToPoint2(this.props.max_prize /* 0.95 */)
    );
    let public_bet_amount = this.props.public_bet_amount;

    if (this.props.game_mode === 'Spleesh!') {
      public_bet_amount = (
        <>
          {convertToCurrency(this.props.spleesh_bet_unit)} -{' '}
          {convertToCurrency(this.props.spleesh_bet_unit * 10)}
        </>
      );
      public_max_return = convertToCurrency(
        updateDigitToPoint2(
          this.props.spleesh_bet_unit * 55 + this.props.bet_amount /* 0.9 */
        )
      );
    } else if (this.props.game_mode === 'Quick Shoot') {
      public_max_return = convertToCurrency(
        updateDigitToPoint2(this.props.max_return)
      );
    } else if (this.props.game_mode === 'RPS') {
      public_max_return = convertToCurrency(
        updateDigitToPoint2(this.props.bet_amount)
      );
    }

    return (
      <div className="pre-summary-panel">
        <div className="data-item">
          <div className="label your-bet-amount">YOUR BET</div>
          <div className="value">
            {convertToCurrency(updateDigitToPoint2(this.props.bet_amount))}
          </div>
        </div>
        {/* {['Mystery Box', 'Spleesh!', 'Quick Shoot'].includes(
          this.props.game_mode
        ) && (
          <div className="data-item">
            <div className="label public-bet-amount">THEIR BET</div>
            <div className="value">{public_bet_amount}</div>
          </div>
        )} */}
        <div className="data-item">
          <div className="label your-max-return">TARGET ROI</div>
          <div className="value">
            {this.props.game_mode === 'Brain Game' ? (
              <>
                <span style={{ fontSize: '2em' }}>∞</span>
              </>
            ) : (
              convertToCurrency(updateDigitToPoint2(this.props.max_return))
            )}
          </div>
        </div>
        {['Bang!', 'Roll'].includes(this.props.game_mode) && (
          <div className="data-item">
            <div className="label public-max-return">Average Multiplier</div>
            <div className="value">{this.props.aveMultiplier}x</div>
          </div>
        )}

        <div className="data-item">
          <div className="label win-chance">Expected Value</div>
          <div className="value">
            {convertToCurrency(this.props.winChance) === -0
              ? convertToCurrency(0.0).toFixed(2)
              : convertToCurrency(this.props.winChance)}
          </div>
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.game_mode !== this.props.game_mode) {
      if (this.props.game_mode === 'RPS') {
        this.setState({ winChance: 33 });
      } else if (this.props.game_mode === 'Spleesh!') {
        this.setState({ winChance: 69 });
      } else if (this.props.game_mode === 'Mystery Box') {
        this.setState({ winChance: 10 });
      } else if (this.props.game_mode === 'Quick Shoot') {
        this.setState({ winChance: 15 });
      } else if (this.props.game_mode === 'Brain Game') {
        this.setState({ winChance: '0 - 100' });
      } else if (this.props.game_mode === 'Drop Game') {
        this.setState({ winChance: 42 });
      } else if (this.props.game_mode === 'Bang!') {
        this.setState({ winChance: 42 });
      }
    }
  }

  total_summery() {
    let public_bet_amount = this.props.public_bet_amount;
    let public_max_return = (
      <> {convertToCurrency(updateDigitToPoint2(this.props.max_prize))} </>
    );

    if (this.props.game_mode === 'Spleesh!') {
      public_bet_amount = (
        <>
          {convertToCurrency(this.props.spleesh_bet_unit)} -{' '}
          {convertToCurrency(this.props.spleesh_bet_unit * 10)}
        </>
      );
    } else if (this.props.game_mode === 'Quick Shoot') {
      public_max_return = convertToCurrency(
        updateDigitToPoint2(this.props.max_return)
      );
    }

    return (
      <div className="summary-panel">
        <h3 className="game-sub-title">AI Summary</h3>
        <div className="summary-info">
          <div className="summary-item">
            <div className="summary-item-name">Expected Value</div>
            <div className="summary-item-value">
              {convertToCurrency(this.props.winChance)}
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-item-name">Bet Amount</div>
            <div className="summary-item-value">
              {convertToCurrency(updateDigitToPoint2(this.props.bet_amount))}
            </div>
          </div>
          {(this.props.game_mode === 'Spleesh!' ||
            this.props.game_mode === 'Quick Shoot') && (
            <div className="summary-item">
              <div className="summary-item-name">Public Bet Amount</div>
              <div className="summary-item-value">
                {convertToCurrency(public_bet_amount)}
              </div>
            </div>
          )}
          {this.props.game_mode === 'Quick Shoot' && (
            <div className="summary-item">
              <div className="summary-item-name">Public Max Return</div>
              <div className="summary-item-value">{public_max_return}</div>
            </div>
          )}
          {this.props.game_mode === 'Bang!' ||
            (this.props.game_mode === 'Roll' && (
              <div className="summary-item">
                <div className="summary-item-name">Average Multiplier</div>
                <div className="summary-item-value">
                  {this.props.aveMultiplier}x
                </div>
              </div>
            ))}
          <div className="summary-item">
            <div className="summary-item-name">TARGET ROI</div>
            <div className="summary-item-value">
              {convertToCurrency(updateDigitToPoint2(this.props.max_return))}
            </div>
          </div>
          {this.props.endgame_type && (
            <div className="summary-item">
              <div className="summary-item-name">Payout</div>
              <div className="summary-item-value">
                {convertToCurrency(
                  updateDigitToPoint2(this.props.endgame_amount)
                )}
              </div>
            </div>
          )}
      <div className="summary-item">
  <div className="summary-item-name">Music</div>
  <div className="summary-item-value">
    {this.props.youtubeUrl ? this.props.youtubeUrl : "No Music"}
  </div>
</div>

          <div className="summary-item">
            <div className="summary-item-name">Privacy</div>
            <div className="summary-item-value">
              {this.props.is_private ? 'Private' : 'Public'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.props.step === 1) {
      return <></>;
    } else if (this.props.step === 5) {
      return this.total_summery();
    }
    return this.pre_summery();
  }
}

export default Summary;
