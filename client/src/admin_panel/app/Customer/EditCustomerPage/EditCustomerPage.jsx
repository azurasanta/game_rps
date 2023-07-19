import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setUrl } from '../../../../redux/Auth/user.actions';
import {
  acGetCustomerInfo,
  updateCustomer,
  getCustomerStatisticsData,
  getRoomStatisticsData
} from '../../../../redux/Customer/customer.action';
import ContainerHeader from '../../../../components/ContainerHeader';
import EditCustomerForm from './EditCustomerForm';
import StatisticsForm from './StatisticsForm';
import {
  warningMsgBar,
  infoMsgBar
} from '../../../../redux/Notification/notification.actions';
import moment from 'moment';
import history from '../../../../redux/history';
import { updateDigitToPoint2 } from '../../../../util/helper';
import { convertToCurrency } from '../../../../util/conversion';

class EditCustomerPage extends Component {
  state = {
    _id: '',
    balance: 0,
    username: '',
    email: '',
    avatar: '',
    bio: '',
    buttonDisable: true,
    is_banned: false,
    joined_date: '',
    gameLogList: [],
    deposit: 0,
    withdraw: 0,
    gameProfit: 0,
    gamePlayed: 0,
    totalWagered: 0,
    netProfit: 0,
    profitAllTimeHigh: 0,
    profitAllTimeLow: 0
  };

  async componentDidMount() {
    const customer_id = this.props.match.params._id;

    if (customer_id && this.state._id !== customer_id) {
      this.setState({ _id: customer_id });
    }

    this.props.setUrl(this.props.match.path);
    const user = await this.props.acGetCustomerInfo(customer_id);
    if (user)
      this.setState({
        balance: updateDigitToPoint2(user.balance),
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        is_banned: user.is_deleted,
        joined_date: moment(user.created_at).format('LL')
      });

    const result = await this.props.getCustomerStatisticsData(customer_id);

    this.setState({
      ...result,
      netProfit: result.withdraw - result.deposit
    });
  }

  handleCancel = () => {
    this.setState({
      buttonDisable: true
    });
    history.push(`/admin/customers/`);
  };

  onSaveForm = e => {
    e.preventDefault();
    this.props.updateCustomer({
      _id: this.state._id,
      balance: this.state.balance
    });
  };

  onDelete = e => {
    e.preventDefault();
    console.log(this.state);

    if (
      !window.confirm(
        'Do you want to delete this customer? Balance: ' +
          convertToCurrency(this.state.balance)
      )
    ) {
      return;
    }

    this.props.updateCustomer({
      _id: this.state._id,
      is_deleted: true
    });
  };

  onRestore = e => {
    e.preventDefault();
    if (!window.confirm('Do you want to restore this customer?')) {
      return;
    }

    this.props.updateCustomer({
      _id: this.state._id,
      is_deleted: false
    });
  };

  render() {
    return (
      <>
        <ContainerHeader title="Edit Customer Profile" />
        <EditCustomerForm
          handleCancel={this.handleCancel}
          handleChange={e => {
            this.setState({
              [e.target.name]: e.target.value
            });
          }}
          onSaveForm={this.onSaveForm}
          _id={this.state._id}
          balance={this.state.balance}
          username={this.state.username}
          email={this.state.email}
          bio={this.state.bio}
          avatar={this.state.avatar}
          is_banned={this.state.is_banned}
          onDelete={this.onDelete}
          onRestore={this.onRestore}
        />
        <StatisticsForm
          username={this.state.username}
          joined_date={this.state.joined_date}
          gameLogList={this.state.gameLogList}
          deposit={this.state.deposit}
          withdraw={this.state.withdraw}
          gameProfit={this.state.gameProfit}
          balance={this.state.balance}
          gamePlayed={this.state.gamePlayed}
          totalWagered={this.state.totalWagered}
          netProfit={this.state.netProfit}
          profitAllTimeHigh={this.state.profitAllTimeHigh}
          profitAllTimeLow={this.state.profitAllTimeLow}
          getRoomStatisticsData={this.props.getRoomStatisticsData}
        />
      </>
    );
  }
}

const mapStateToProps = state => ({
  _id: state.itemReducer._id,
  productName: state.itemReducer.productName,
  price: state.itemReducer.price,
  image: state.itemReducer.image,
  startDateTime: state.itemReducer.startDateTime,
  expireDateTime: state.itemReducer.expireDateTime
});

const mapDispatchToProps = {
  setUrl,
  warningMsgBar,
  infoMsgBar,
  acGetCustomerInfo,
  updateCustomer,
  getCustomerStatisticsData,
  getRoomStatisticsData
};

export default connect(mapStateToProps, mapDispatchToProps)(EditCustomerPage);
