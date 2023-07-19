import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setUrl } from '../../../redux/Auth/user.actions';
import { getStatisticsData } from '../../../redux/AdminAuth/admin.actions';
import { warningMsgBar } from '../../../redux/Notification/notification.actions';
import ContainerHeader from '../../../components/ContainerHeader';
import styled from 'styled-components';
import MyChart from "./Charts";
import { addCurrencySignal } from '../../../util/helper';
import Elevation from '../../../Styles/Elevation';

class PalletPage extends Component {
  state = {
    totalGameCreated: 0,
    totalGameJoined: 0,
    totalWagered: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    volumeOfBets: [],
  };

  async componentDidMount() {
    this.props.setUrl(this.props.match.path);
    const result = await this.props.getStatisticsData();
    this.setState({...result});
  }
  
  render() {
    return (
      <>
        <ContainerHeader title={`All Stats`} />
        <MainContent>
          <StatsDiv>
            <div>Total Games Created: {this.state.totalGameCreated}</div>
            <div>Total Games Joined: {this.state.totalGameJoined}</div>
            <div>Total Wagered: {addCurrencySignal(this.state.totalWagered)}</div>
            <div>Total Deposited: {addCurrencySignal(this.state.totalDeposited)}</div>
            <div>Total Withdrawn: {addCurrencySignal(this.state.totalWithdrawn)}</div>
            <div>Total in PayPal Bank (Total Deposited - Total Withdrawn): {addCurrencySignal(this.state.totalDeposited - this.state.totalWithdrawn)}</div>
            <div>Total Virtual Balance + Live Stakes Running: {addCurrencySignal(0)}</div>
          </StatsDiv>
          <MyChart series={this.state.volumeOfBets}></MyChart>
        </MainContent>
      </>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {
  setUrl,
  warningMsgBar,
  getStatisticsData
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PalletPage);

const MainContent = styled.main`
  grid-area: MainContent;
  width: 100%;
  grid-gap: 20px;
  grid-template-columns: repeat(12, 1fr);
  grid-template-areas: 'PalletInfoCop PalletInfoCop PalletInfoCop HistoryCop HistoryCop HistoryCop Charts Charts Charts Charts Charts Charts';
  @media (max-width: 1200px) {
    grid-template-areas:
      'PalletInfoCop PalletInfoCop PalletInfoCop PalletInfoCop . . . HistoryCop HistoryCop HistoryCop HistoryCop HistoryCop'
      'Charts Charts Charts Charts Charts Charts Charts Charts Charts Charts Charts Charts';
  }
`;

const StatsDiv = styled.div`
  width: 100%;
  border-radius: 5px;
  background-color: #424242;
  padding: 20px;
  margin: 5px 0;
  font-size: 16px;
  line-height: 30px;
  ${Elevation[2]}
`;
