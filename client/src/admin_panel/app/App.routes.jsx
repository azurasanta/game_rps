import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import LayoutCop from '../Layout/LayoutCop';
import StatisticsPage from './StatisticsPage/StatisticsPage';
import ProductPage from '../app/ProductPages/ProductSerchPage/ProductPage';
import ProductCreatePage from './ProductPages/ProductCreatePage/ProductCreatePage';
import CustomersPage from './Customer/CustomerPage';
import ActivityPage from './Activity/ActivityPage';
import EditCustomerPage from './Customer/EditCustomerPage/EditCustomerPage';
import QuestionPage from './Question/QuestionPage';
import QuestionEditPage from './Question/QuestionEditPage';
import SettingsPage from './SettingsPage/SettingsPage';

export class AppMainRoute extends Component {
  render() {
    const { match } = this.props;

    return (
      <LayoutCop>
        <Switch>
          <Route 
            exact
            path={`${match.path}`}
            component={CustomersPage}
          />
          <Route
            exact
            path={`${match.path}/customers`}
            component={CustomersPage}
          />
          <Route 
            exact
            path={`${match.path}/customer/:_id`}
            component={EditCustomerPage}
          />
          <Route
            exact
            path={`${match.path}/activities`}
            component={ActivityPage}
          />
          <Route 
            exact
            path={`${match.path}/question`}
            component={QuestionPage}
          />
          <Route 
            exact
            path={`${match.path}/question/new`}
            component={QuestionEditPage}
          />
          <Route 
            exact
            path={`${match.path}/question/:_id`}
            component={QuestionEditPage}
          />
          <Route 
            exact
            path={`${match.path}/product`}
            component={ProductPage}
          />
          <Route
            exact
            path={`${match.path}/product/new`}
            component={ProductCreatePage}
          />
          <Route
            exact
            path={`${match.path}/product/:_id`}
            component={ProductCreatePage}
          />
          <Route
            exact
            path={`${match.path}/statistics`}
            component={StatisticsPage}
          />
          <Route
            exact
            path={`${match.path}/settings`}
            component={SettingsPage}
          />
          
        </Switch>
      </LayoutCop>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppMainRoute);
