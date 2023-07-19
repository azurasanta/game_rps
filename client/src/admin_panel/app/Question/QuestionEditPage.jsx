import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setUrl } from '../../../redux/Auth/user.actions';
import ContainerHeader from '../../../components/ContainerHeader';
import { createQuestion, getQuestion, updateQuestion, deleteQuestion, setCurrentQuestionInfo, getBrainGameType, addBrainGameType, removeBrainGameType } from '../../../redux/Question/question.action';
import QuestionEditForm from './QuestionEditForm';
import { warningMsgBar, infoMsgBar } from '../../../redux/Notification/notification.actions';
import history from '../../../redux/history';

class QuestionEditPage extends Component {
  state = {
    _id: '',
    question: '',
    answers: [],
    incorrect_answers: [],
    brain_game_type: 1,
    buttonDisable: true,
    game_type_list: [],
  };

  static getDerivedStateFromProps(props, state) {
    return {
      _id: props._id,
      question: props.question,
      answers: props.answers,
      incorrect_answers: props.incorrect_answers,
      brain_game_type: props.brain_game_type,
      game_type_list: props.game_type_list
    };
  }

  componentDidMount() {
    this.props.getBrainGameType();

    if (this.props.match.params._id && this.state._id !== this.props.match.params._id) {
      this.props.setCurrentQuestionInfo({ _id: this.props.match.params._id });
    }

    this.props.setUrl(this.props.match.path);
    this.props.getQuestion();
  }

  setOnDelete = () => {
    this.props.deleteQuestion(this.state._id);
    this.handelCancel();
  };

  handelCancel = () => {
    this.setState({
      buttonDisable: true,
    });
    this.props.setCurrentQuestionInfo({
      _id: '',
      question: '',
      answers: [],
      new_answer: '',
      brain_game_type: 1
    });
    history.push(`/admin/question/`);
  };

  onSubmitFrom = async e => {
    e.preventDefault();
    this.props.infoMsgBar(`question created`);
    await this.props.createQuestion(this.state);
    this.handelCancel();
  };

  onSaveForm = async e => {
    e.preventDefault();
    this.props.infoMsgBar(`question saved`);
    await this.props.updateQuestion(this.state);
    this.handelCancel();
  };

  buttonChange = (question, answers) => {
    if (question !== '' && question.length >= 3 && answers.length > 0) {
      this.setState({ buttonDisable: false });
    } else {
      this.setState({ buttonDisable: true });
    }
  };

  updateTextField = (name, value, length) => {
    if (value === '' || value.length <= length) {
      if (name === 'question') {
        this.buttonChange(value, this.state.answers);
      }

      this.props.setCurrentQuestionInfo({ [name]: value });
    } else {
      this.props.warningMsgBar(`Value length is biggest than ${length}`);
    }
  };

  handleChange = (name, value) => {
    if (name === 'answers') {
      this.buttonChange(this.state.question, value);
    } else if (name === 'brain_game_type' || name === 'incorrect_answers') {
      this.buttonChange(this.state.question, this.state.answers);
    }
    this.props.setCurrentQuestionInfo({ [name]: value });
  };

  render() {
    return (
      <>
        <ContainerHeader
          title={this.state._id === '' ? 'New Question' : 'Edit Question'}
        />
        <QuestionEditForm
          handelCancel={this.handelCancel}
          updateTextField={this.updateTextField}
          onSubmitFrom={this.onSubmitFrom}
          handleChange={this.handleChange}
          onSaveForm={this.onSaveForm}
          setOnDelete={this.setOnDelete}
          buttonDisable={this.state.buttonDisable}
          addBrainGameType={this.props.addBrainGameType}
          removeBrainGameType={this.props.removeBrainGameType}
        />
      </>
    );
  }
}

const mapStateToProps = state => ({
  _id: state.questionReducer._id,
  question: state.questionReducer.question,
  answers: state.questionReducer.answers,
  incorrect_answers: state.questionReducer.incorrect_answers,
  brain_game_type: state.questionReducer.brain_game_type,
  game_type_list: state.questionReducer.game_type_list
});

const mapDispatchToProps = {
  setUrl,
  warningMsgBar,
  infoMsgBar,
  createQuestion,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  setCurrentQuestionInfo,
  getBrainGameType,
  addBrainGameType,
  removeBrainGameType
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestionEditPage);
