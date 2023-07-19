import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { acGetCustomerInfo } from '../../redux/Customer/customer.action';

import {
  setUrl,
  getUser
 } from '../../redux/Auth/user.actions';
 import { createQuestion, getQuestion, updateQuestion, deleteQuestion, setCurrentQuestionInfo, getBrainGameTypes, addBrainGameType, removeBrainGameType } from '../../redux/Question/question.action';
import { warningMsgBar, infoMsgBar } from '../../redux/Notification/notification.actions';
import history from '../../redux/history';
import QuestionEditForm from '../../admin_panel/app/Question/QuestionEditForm';

Modal.setAppElement('#root');

const customStyles = {
  overlay: {
    zIndex: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    background: 'transparent',
    padding: 0,
  }
};



class AddQuestionModal extends Component {

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
    const { _id } = this.props.userInfo;

    if (_id) {
      this.props.getBrainGameTypes(_id);
    }
  
  
  
    // if (this.props.match.params._id && this.state._id !== this.props.match.params._id) {
    //   this.props.setCurrentQuestionInfo({ _id: this.props.match.params._id });
    // }
  
    // this.props.setUrl(this.props.match.path);
    // this.props.getQuestion();
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
    this.props.getBrainGameTypes();
    this.props.closeModal();
    // history.push(`/admin/question/`);
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
      <Modal
        isOpen={this.props.modalIsOpen}
        onRequestClose={this.closeQuestionModal}
        style={customStyles}
        contentLabel="Add Question Modal"
      >
        <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
          <div className="modal-body edit-modal-body question-modal-body">
<div className='modal-header'>
            <h2 className="modal-title">Add Your Own #BrainGame</h2>
            <button className="btn-close" onClick={this.handelCancel}>
              ×
            </button>
</div>
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
           
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.auth.user,
  isDarkMode: state.auth.isDarkMode,
  _id: state.questionReducer._id,
  question: state.questionReducer.question,
  answers: state.questionReducer.answers,
  incorrect_answers: state.questionReducer.incorrect_answers,
  brain_game_type: state.questionReducer.brain_game_type,
  game_type_list: state.questionReducer.game_type_list
});

const mapDispatchToProps = {
  setUrl,
  getUser,
  acGetCustomerInfo,
  warningMsgBar,
  infoMsgBar,
  createQuestion,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  setCurrentQuestionInfo,
  getBrainGameTypes,
  addBrainGameType,
  removeBrainGameType
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddQuestionModal);



