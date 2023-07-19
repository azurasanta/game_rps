import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import CreateGame from '../main_pages/CreateGame';
import SiteWrapper from '../SiteWrapper';
import MainPage from '../main_pages/MainPage';
import JoinGame from '../main_pages/JoinGame';
import ChatPage from '../MyGames/ChatPage';
import ChangePasswordPage from '../main_pages/ChangePasswordPage';
import Leaderboards from '../main_pages/Leaderboards';
import ProfilePage from '../main_pages/ProfilePage';

export class GameMainRoute extends Component {
  render() {
    const { match } = this.props;

    return (
      <SiteWrapper>
        <Switch>
          <Route 
            exact
            path={`${match.path}create/:game_type_name`}
            component={CreateGame}
          />
          <Route 
            exact
            path={`${match.path}join/:id`}
            component={JoinGame}
          />
          <Route 
            exact
            path={`${match.path}chat/:id`}
            component={ChatPage}
          />
          <Route
            exact
            path={`${match.path}changePassword/:code`}
            component={ChangePasswordPage}
          />
          <Route
            exact
            path={`${match.path}profile/:user_id`}
            component={ProfilePage}
          />
          <Route
            exact
            path={`${match.path}leaderboards`}
            component={Leaderboards}
          />
          <Route 
            path={`${match.path}`}
            component={MainPage}
          />
        </Switch>
      </SiteWrapper>
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
)(GameMainRoute);
