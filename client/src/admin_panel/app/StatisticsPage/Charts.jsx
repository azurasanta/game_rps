import React from 'react';
import styled from 'styled-components';
import Elevation from '../../../Styles/Elevation';
import { addCurrencySignal } from '../../../util/helper';

const xLabels = [
  '0 RPS - 1 RPS',
  '1 RPS - 10 RPS',
  '10 RPS - 20 RPS',
  '20 RPS - 30 RPS',
  '30 RPS - 40 RPS',
  '40 RPS - 50 RPS',
  '50 RPS - 60 RPS',
  '60 RPS - 70 RPS',
  '70 RPS - 80 RPS',
  '80 RPS - 90 RPS',
  '90 RPS - 100 RPS',
  '100 RPS -',
];

class HeatmapChart extends React.Component {
  constructor(props) {
    super(props);

    this.chartRef = React.createRef();
  }

  componentDidMount() {
    this.createHeatmapChart();
  }

  componentDidUpdate() {
    this.createHeatmapChart();
  }

  createHeatmapChart() {
    const chartData = this.props.series;
    const chartContainer = this.chartRef.current;

    while (chartContainer.firstChild) {
      chartContainer.firstChild.remove();
    }

    const chartTable = document.createElement('table');
    chartTable.className = 'heatmap-table';

    for (let i = 0; i < chartData.length; i++) {
      const row = document.createElement('tr');
      const data = chartData[i];

      for (let j = 0; j < data.length; j++) {
        const cell = document.createElement('td');
        cell.textContent = data[j];
        row.appendChild(cell);
      }

      chartTable.appendChild(row);
    }

    chartContainer.appendChild(chartTable);
  }

  render() {
    return (
      <ChartDivEl>
        <ChartContainer ref={this.chartRef} />
      </ChartDivEl>
    );
  }
}

export default HeatmapChart;

const ChartDivEl = styled.div`
  grid-area: Charts;
  justify-self: center;
  width: 100%;
  border-radius: 5px;
  background-color: #424242;
  padding: 5px;
  align-items: center;
  ${Elevation[2]}
`;

const ChartContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  width: 100%;

  .heatmap-table {
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    width: 100%;
  }

  .heatmap-table td {
    padding: 8px;
    text-align: center;
    font-size: 14px;
  }
`;
