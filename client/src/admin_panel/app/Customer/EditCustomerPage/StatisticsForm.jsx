import React from 'react';
import ReactApexChart from 'react-apexcharts';
import styled from 'styled-components';
import Elevation from '../../../../Styles/Elevation';
import moment from 'moment';
import './style.css';
import { convertToCurrency } from '../../../../util/conversion';

function generateData(gameLogList) {
  const series = [];
  let totalProfit = 0;
  gameLogList &&
    gameLogList.forEach((log, index) => {
      totalProfit += log.profit;
      series.push({ x: `${Number(index) + 1}`, y: totalProfit });
    });
  return series;
}

class StatisticsForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      room_info: null,
      loaded: true
    };
  }

  dataPointSelection = async (event, chartContext, config) => {
    console.log(this.props.gameLogList[config.dataPointIndex]);
    const gameLogList = this.props.gameLogList;
    const room_id = gameLogList[config.dataPointIndex].room_id;
    const actionList = await this.props.getRoomStatisticsData(room_id);
    this.setState({
      room_info: {
        room_name: gameLogList[config.dataPointIndex].game_id,
        actionList: actionList
      }
    });
  };

  // componentDidUpdate(prevProps) {
  //   if (
  //     prevProps.gamePlayed !== this.props.gamePlayed ||
  //     prevProps.totalWagered !== this.props.totalWagered
  //     // prevProps.gameProfit !== this.props.gameProfit ||
  //     // prevProps.profitAllTimeHigh !== this.props.profitAllTimeHigh ||
  //     // prevProps.profitAllTimeLow !== this.props.profitAllTimeLow
  //   ) {
  //     this.setState({ loaded: true });
  //   }
  // }
  getRank(totalWagered) {
    const level = Math.floor(Math.cbrt(totalWagered / 100)) + 1;
    const fullStars = Math.floor(level);
    const halfStars = Math.floor((level - fullStars) * 2);
    const quarterStars = Math.floor((level - fullStars - halfStars / 2) * 4);
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
      stars += '★';
    }
    if (halfStars === 1) {
      stars += '½';
    }
    for (let i = 0; i < quarterStars; i++) {
      stars += '¼';
    }
  
    const nextLevelWager = Math.pow(level * 500, 3);
    const progress = Math.min(1, totalWagered / nextLevelWager);
    const progressBarWidth = 100;
    const progressBarFilled = progress * progressBarWidth;
  
    return (
      <div>
        <div className="level-number">{level.toLocaleString()}</div>
        <div className="stars">{stars}</div>
        <div className="progress-bar-outer" style={{ width: `${progressBarWidth}px` }}>
          <div className="progress-bar-filled" style={{ width: `${progressBarFilled}px` }}></div>
        </div>
      </div>
    );
  }
  
  
  

  render() {
    const gameLogList = this.props.gameLogList;
    const options = {
      chart: {
        background: '#424242',
        type: 'area',
        stacked: false,
        toolbar: {
          show: true,
          tools: {
            download: false // <== line to add
          }
        },
        
        pan: {
          enabled: true,
          type: 'x'
        },
        zoom: {
          type: 'x',
          enabled: true,
          autoScaleYaxis: true
        },
        events: {
          dataPointSelection: this.dataPointSelection
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          inverseColors: true,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          colorStops: [
            {
              offset: 0,
              color: '#ffb000',
              opacity: 1
            },
            {
              offset: 20,
              color: '#ff550a',
              opacity: 1
            },
            {
              offset: 60,
              color: '#dd1e30',
              opacity: 1
            },
            {
              offset: 100,
              color: '#ef38d0',
              opacity: 1
            }
          ]
        }
      },
      stroke: {
        width: 5,
        curve: 'smooth'
      },
      theme: {
        mode: 'dark'
      },
      dataLabels: {
        enabled: false
      },
      animations: {
        enabled: false
      },
      xaxis: {
        // range: 1500,
        // min: 0,
        // max: 1500,
        forceNiceScale: true,
        labels: {
          show: false,
          rotate: 0,
          hideOverlappingLabels: true
        }
      },
      yaxis: {
        labels: {
          formatter: function(value) {
            const convertToCurrency = input => {
              let number = Number(input);
              if (!isNaN(number)) {
                let [whole, decimal] = number
                  .toFixed(2)
                  .toString()
                  .split('.');
                whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                return `${whole}.${decimal}`;
              } else {
                return input;
              }
            };

            return convertToCurrency(value);
          }
        }
      },
      tooltip: {
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          const convertToCurrency = input => {
            let number = Number(input);
            if (!isNaN(number)) {
              let [whole, decimal] = number
                .toFixed(2)
                .toString()
                .split('.');
              whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              return `<svg id='busd' width="0.7em" height="0.7em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 336.41 337.42"><defs><style>.cls-1{fill:#f0b90b;stroke:#f0b90b;}</style></defs><title>BUSD Icon</title><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M168.2.71l41.5,42.5L105.2,147.71l-41.5-41.5Z"/><path class="cls-1" d="M231.2,63.71l41.5,42.5L105.2,273.71l-41.5-41.5Z"/><path class="cls-1" d="M42.2,126.71l41.5,42.5-41.5,41.5L.7,169.21Z"/><path class="cls-1" d="M294.2,126.71l41.5,42.5L168.2,336.71l-41.5-41.5Z"/></g></g></svg>&thinsp;${whole}.${decimal}`;
            } else {
              return input;
            }
          };
          return `<table class="chart-tooltip">
              <tr>
              <td>GAME ID: </td>
              <td>&nbsp;${gameLogList[dataPointIndex].game_id}</td>
              </tr>
              <tr>
              <td>PLAYED: </td>
              <td>&nbsp;${moment(
                gameLogList[dataPointIndex].played
              ).fromNow()}</td>
              </tr>
              <tr>
              <td>BET: </td>
              <td>&nbsp;${convertToCurrency(
                gameLogList[dataPointIndex].bet
              )}</td>
              </tr>
              <tr>
              <td>AGAINST: </td>
              <td>&nbsp;${gameLogList[dataPointIndex].opponent.username}</td>
              </tr>
              <tr>
              <td>PROFIT: </td>
              <td>&nbsp;${convertToCurrency(
                gameLogList[dataPointIndex].profit
              )}</td>
              </tr>
              
                </table>`;
        }
      }
    };
    const series = [
      {
        name: 'Jan',
        data: generateData(gameLogList),

        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.9,
            stops: [0, 90, 100]
          }
        }
      }
    ];
    const {
      gamePlayed,
      totalWagered,
      netProfit,
      gameProfit,
      profitAllTimeHigh,
      profitAllTimeLow
    } = this.props;

    return (
      <ChartDivEl>
      <div className="rank-badge">
  <h2>{this.props.username}</h2>
  <div className="stars">{this.getRank(this.props.totalWagered)}</div>
</div>

        <div className="statistics-container">
          <div>
            {/* <div className="statistics-panel">
              <h5>BREAKDOWN</h5>
              <div>
                Deposits:{' '}
                {addCurrencySignal(updateDigitToPoint2(this.props.deposit))}
              </div>
              <div>
                Withdrawals:{' '}
                {addCurrencySignal(updateDigitToPoint2(this.props.withdraw))}
              </div>
              <div>
                Game Profit:{' '}
                {addCurrencySignal(updateDigitToPoint2(this.props.gameProfit))}
              </div>
              <div>
                Balance:{' '}
                {addCurrencySignal(updateDigitToPoint2(this.props.balance))}
              </div>
            </div> */}
            <div className="statistics-panel">
              <h5>PERFORMANCE</h5>
              {!this.state.loaded ? (
                <div className="loading">LOADING...</div>
              ) : (
                <table>
                  <tbody>
                    <tr>
                      <td className="label">Game Played</td>
                      <td className="value">{gamePlayed}</td>
                    </tr>
                    <tr>
                      <td className="label">Total Wagered</td>
                      <td className="value">
                        {convertToCurrency(totalWagered)}
                      </td>
                    </tr>
                    <tr>
                      <td className="label">Net Profit</td>
                      <td className="value">{convertToCurrency(gameProfit)}</td>
                      {/* <td className="value">{netProfit}</td> */}
                    </tr>
                    <tr>
                      <td className="label">Profit ATH</td>
                      <td className="value">
                        {convertToCurrency(profitAllTimeHigh)}
                      </td>
                    </tr>
                    <tr>
                      <td className="label">Profit ATL</td>
                      <td className="value">
                        {convertToCurrency(profitAllTimeLow)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div>
            {this.state.room_info && (
              <div className="statistics-panel">
                <h5>ROOM INFO ({this.state.room_info.room_name})</h5>
                <table>
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>Actor</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.room_info.actionList.map((action, key) => (
                      <tr key={action._id}>
                        <td>{moment(action.created_at).format('LLL')}</td>
                        <td>{action.actor}</td>
                        <td>{action.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <ChartEl
          options={options}
          series={series}
          className={
            series[0].data.length > 100
              ? 'step-10'
              : series[0].data.length > 20
              ? 'step-5'
              : 'step-1'
          }
          type="line"
          height="350"
          width="100%"
        />
      </ChartDivEl>
    );
  }
}

export default StatisticsForm;

const ChartDivEl = styled.div`
  grid-area: Charts;
  justify-self: center;
  width: 100%;
  border-radius: 5px;
  background-color: #424242;
  padding: 25px;
  align-items: center;
  ${Elevation[2]}
`;

const H2 = styled.h2`
  border-bottom: 3px solid white;
`;

const Span = styled.span`
  font-size: 14px;
  float: right;
  margin-top: 18px;
`;

const ChartEl = styled(ReactApexChart)``;
