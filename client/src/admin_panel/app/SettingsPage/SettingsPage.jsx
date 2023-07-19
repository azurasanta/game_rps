import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setUrl } from '../../../redux/Auth/user.actions';
import { getSettings, saveSettings } from '../../../redux/Setting/setting.action';
import ContainerHeader from '../../../components/ContainerHeader';
import SettingsForm from './SettingsForm';

class SettingsPage extends Component {
  state = {
    commission: 0,
  };

  async componentDidMount() {
    this.props.setUrl(this.props.match.path);
    const settings = await this.props.getSettings();
    console.log(settings);
    this.setState({ ...settings });
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  onSaveForm = (e) => {
    e.preventDefault();
    this.props.saveSettings([
      {name: 'commission', value: this.state.commission}
    ]);
  }
  
  render() {
    return (
      <>
        <ContainerHeader title={`System Settings`} />
        <SettingsForm commission={this.state.commission} handleChange={this.handleChange} onSubmitFrom={this.onSaveForm} />
      </>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {
  setUrl,
  getSettings,
  saveSettings
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsPage);
