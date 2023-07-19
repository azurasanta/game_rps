import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setCurrentQuestionInfo } from '../../redux/Question/question.action';
import DefaultBetAmountPanel from './DefaultBetAmountPanel';
import AddQuestionModal from '../modal/AddQuestionModal';
import { Button } from '@material-ui/core';

class BrainGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            question: '',
            answers: [],
            incorrect_answers: [],
            brain_game_type: 1,
            buttonDisable: true,
            game_type_list: [],
            showModal: false,
            is_other: (this.props.bet_amount === 1 || this.props.bet_amount === 2.5 || this.props.bet_amount === 5 || this.props.bet_amount === 10 || this.props.bet_amount === 25) ? 'hidden' : ''
        };
    }

    toggleModal = () => {
        this.setState({ showModal: !this.state.showModal });
      };
    

    render() {
        
        return (this.props.step === 1 ? 
            <DefaultBetAmountPanel bet_amount={this.props.bet_amount} onChangeState={this.props.onChangeState} game_type="Brain Game" />
            :
            <div className="game-info-panel">
                <h3 className="game-sub-title">Game Type</h3>
                <div className="select-buttons-panel brain-game">
                    {this.props.game_type_list.map((game_type, index) => (
                        <Button className={(this.props.brain_game_type === game_type._id ? ' active' : '')} 
                            onClick={(e) => { 
                                this.props.setCurrentQuestionInfo({brain_game_type: game_type._id}); 
                            }} key={index}>
                            {game_type.game_type_name}
                        </Button>
                    ))}
                    <Button className="add-new-game-type" onClick={this.toggleModal}>
                      + Add New
                    </Button>
                    {this.state.showModal && (
         
            <AddQuestionModal
            modalIsOpen={this.state.showModal}
              closeModal={this.toggleModal}
              darkMode={this.props.isDarkMode}
            />
          
        )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    game_type_list: state.questionReducer.game_type_list,
    isDarkMode: state.auth.isDarkMode,
});

const mapDispatchToProps = {
    setCurrentQuestionInfo,
    
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BrainGame);
