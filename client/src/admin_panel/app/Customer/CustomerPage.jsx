import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { setUrl } from '../../../redux/Auth/user.actions';
import ContainerHeader from '../../../components/ContainerHeader';
import CustomerTable from './CustomerTable';
import { queryCustomer } from '../../../redux/Customer/customer.action';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { PaperEl } from '../../../Styles/Elements/ToolsEl';

const AntSwitch = withStyles((theme) => ({
  root: {
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
  },
  switchBase: {
    padding: 2,
    color: theme.palette.grey[500],
    '&$checked': {
      transform: 'translateX(12px)',
      color: theme.palette.common.white,
      '& + $track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
    },
  },
  thumb: {
    width: 12,
    height: 12,
    boxShadow: 'none',
  },
  track: {
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.common.white,
  },
  checked: {},
}))(Switch);

class CustomerPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_banned: false
    };
  }

  componentDidMount() {
    this.props.setUrl(this.props.match.path);
    this.props.queryCustomer(10, 1, false);
  }

  handleChange = (event) => {
    this.setState({ is_banned: event.target.checked });
    this.props.queryCustomer(10, 1, event.target.checked);

  };

  render() {
    return (
      <>
        <ContainerHeader
          title={'Customers'}
        />
        <PaperEl elevation={3}>
          <Typography component="div">
            <Grid component="label" container alignItems="center" spacing={1}>
              <Grid item>Normal User</Grid>
              <Grid item>
                <AntSwitch checked={this.state.is_banned} onChange={this.handleChange} name="checkedC" />
              </Grid>
              <Grid item>Banned User</Grid>
            </Grid>
          </Typography>
        </PaperEl>
        <CustomerTable is_banned={this.state.is_banned} />
      </>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {
  setUrl,
  queryCustomer
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomerPage);
