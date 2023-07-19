import React, { Component } from 'react';
import { connect } from 'react-redux';
import history from '../../redux/history';
import { getLeaderboardsInfo } from "../../redux/Logic/logic.actions";

import { withStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import LoopIcon from '@material-ui/icons/Loop';

const styles = (theme) => ({
    root: {
        width: '150px',
        padding: '8px 15px',
        fontSize: '16px',
        background: '#191a1d',
    },
    dropdownStyle: {
    }
});

class Leaderboards extends Component {
    constructor(props) {
        super(props);
        this.state = {
            period: 'all time',
            data: []
        }
    }

    static getDerivedStateFromProps(props, current_state) {
        return null;
    }

    componentDidMount() {
        this.IsAuthenticatedReroute();
    }
    
    IsAuthenticatedReroute = () => {
        if (!this.props.auth) {
            history.push('/');
        }
    };

    onPeriodChanged = (e) => {
        e.preventDefault();
        this.setState({ period: e.target.value });
    }

    refreshTable = (e) => {
        e.preventDefault();
    }

    render() {
        const { classes } = this.props;
        return (
            <div className="leaderboards-page">
                <div className="page-title">
                    <h3>{this.state.period}</h3>
                    <div className="leaderboard-action-panel">
                        <Select
                            value={this.state.period}
                            onChange={this.onPeriodChanged}
                            displayEmpty
                            classes={{ root: classes.root }}
                            MenuProps={{ classes: {paper: classes.dropdownStyle }}}
                        >
                            <MenuItem value="all time">All time</MenuItem>
                            <MenuItem value="last 24 hours">Last 24 hours</MenuItem>
                            <MenuItem value="last 7 days">Last 7 days</MenuItem>
                            <MenuItem value="last months">Last months</MenuItem>
                        </Select>
                        <button onClick={this.refreshTable}><LoopIcon /></button>
                    </div>
                </div>
                <div className="leaderboards-content" style={{width: '300px', overflowX: 'scroll'}} >
                    <table className="table leaderboards-table" >
                        <thead>
                            <tr>
                                <th>#</th>
                                <th className="player">PLAYER</th>
                                <th>WARGERED</th>
                                <th>PROFIT</th>
                                <th>PROFIT (ATH)</th>
                                <th>PROFIT (ATL)</th>
                                <th>BETS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td className="player">Kadin</td>
                                <td>1.12368</td>
                                <td>1.12368</td>
                                <td>1.12368</td>
                                <td>1.12368</td>
                                <td>123</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td className="player">Corey</td>
                                <td>1.12368</td>
                                <td>1.12368</td>
                                <td>1.12368</td>
                                <td>1.12368</td>
                                <td>123</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td className="player">Ruben</td>
                                <td>1.12368</td>
                                <td>1.12368</td>
                                <td>1.12368</td>
                                <td>1.12368</td>
                                <td>123</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
  auth: state.auth.isAuthenticated,
  user_id: state.auth.user._id
});

const mapDispatchToProps = {
    getLeaderboardsInfo
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Leaderboards));
