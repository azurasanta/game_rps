import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setUrl } from '../../../redux/Auth/user.actions';
import ContainerHeader from '../../../components/ContainerHeader';
import ActivityTable from './ActivityTable';
import { queryActivity } from '../../../redux/Customer/customer.action';

class ActivityPage extends Component {
  componentDidMount() {
    this.props.setUrl(this.props.match.path);
    this.props.queryActivity(10, 1);
  }

  render() {
    return (
      <>
        <ContainerHeader
          title={'Customer Activities'}
        />
        <ActivityTable />
      </>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {
  setUrl,
  queryActivity
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivityPage);
