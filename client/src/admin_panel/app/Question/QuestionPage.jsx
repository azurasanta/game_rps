import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setUrl } from '../../../redux/Auth/user.actions';
import ContainerHeader from '../../../components/ContainerHeader';
import QuestionTable from './QuestionTable';
import { queryQuestion } from '../../../redux/Question/question.action'

class QuestionPage extends Component {
  componentDidMount() {
    this.props.setUrl(this.props.match.path);
    this.props.queryQuestion(10, 1);
  }

  render() {
    return (
      <>
        <ContainerHeader
          title={'Questions'}
        />
        <QuestionTable />
      </>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {
  setUrl,
  queryQuestion
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestionPage);
