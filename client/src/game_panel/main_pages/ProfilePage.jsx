import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { updateDigitToPoint2, addCurrencySignal } from '../../util/helper';
import moment from 'moment';
import { convertToCurrency } from '../../util/conversion';

function generateData(gameLogList) {
  const series = [];
  let totalProfit = 0;
  for (let i = 0; i < gameLogList.length; i++) {
    const x = (i + 1).toString();
    totalProfit += gameLogList[i].profit;
    series.push({
      x: x,
      y: totalProfit
    });
  }
  return series;
}

class ProfilePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      room_info: null
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

  render() {
    const gameLogList = this.props.gameLogList;
    const options = {
      chart: {
        background: '#424242',
        type: 'bar',
        stacked: false,
        zoom: {
          type: 'x',
          enabled: true,
          autoScaleYaxis: true
        },
        events: {
          dataPointSelection: this.dataPointSelection
        }
      },
      theme: {
        mode: 'dark'
      },
      dataLabels: {
        enabled: false
      },
      title: {
        text: 'CUMULATIVE PROFIT',
        style: {
          color: 'white'
        }
      },
      xaxis: {
        labels: {
          show: false,
          rotate: 0,
          hideOverlappingLabels: true
        }
      },
      yaxis: {
        labels: {
          formatter: function(value) {
            return addCurrencySignal(value);
          }
        }
      },
      tooltip: {
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          return (
            '<div class="chart-tooltip">' +
            '<div>Game Id: ' +
            gameLogList[dataPointIndex].game_id +
            '</div>' +
            '<div>Played: ' +
            moment(gameLogList[dataPointIndex].played).fromNow() +
            '</div>' +
            '<div>Bet: ' +
            convertToCurrency(gameLogList[dataPointIndex].bet) +
            '</div>' +
            '<div>Opponent:' +
            gameLogList[dataPointIndex].opponent.username +
            '</div>' +
            '<div>Profit:' +
            addCurrencySignal(
              updateDigitToPoint2(gameLogList[dataPointIndex].profit)
            ) +
            '</div>' +
            // '<div>Net Profit:' +
            // gameLogList[dataPointIndex].net_profit +
            // '</div>' +
            '</div>'
          );
        }
      }
    };
    const series = [{ name: 'Jan', data: generateData(gameLogList) }];

    return (
      <div>
        <h2>
          {this.props.username}
          <span>Joined: {this.props.joined_date}</span>
        </h2>
        <div className="statistics-container">
          <div>
            <div className="statistics-panel">
              <h5>PERFORMANCE</h5>
              <div>Game Played: {this.props.gamePlayed}</div>
              <div>
                Total Wagered:{' '}
                {addCurrencySignal(
                  updateDigitToPoint2(this.props.totalWagered)
                )}
              </div>
              <div>
                Net Profit:{' '}
                {addCurrencySignal(updateDigitToPoint2(this.props.netProfit))}
              </div>
              <div>
                Profit All Time High:{' '}
                {addCurrencySignal(
                  updateDigitToPoint2(this.props.profitAllTimeHigh)
                )}
              </div>
              <div>
                Profit All Time Low:{' '}
                {addCurrencySignal(
                  updateDigitToPoint2(this.props.profitAllTimeLow)
                )}
              </div>
            </div>
          </div>
        </div>
        <ReactApexChart
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
      </div>
    );
  }
}

export default ProfilePage;
