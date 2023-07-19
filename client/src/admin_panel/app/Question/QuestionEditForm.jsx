import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import { styleColor } from '../../../Styles/styleThem';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { connect } from 'react-redux';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import CommentIcon from '@material-ui/icons/Comment';
import AddIcon from '@material-ui/icons/Add';
import Divider from '@material-ui/core/Divider';

function QuestionEditForm({
  _id,
  question,
  brain_game_type,
  new_brain_game_type,
  answers,
  new_answer,
  incorrect_answers,
  new_incorrect_answer,
  onSubmitFrom,
  updateTextField,
  handleChange,
  buttonDisable,
  handelCancel,
  onSaveForm,
  setOnDelete,
  game_type_list,
  addBrainGameType,
  removeBrainGameType
}) {
  return (
    <PaperEl elevation={12}>
      <FormEl onSubmit={e => onSubmitFrom(e)}>
        <TopDiv>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="h6">GAME TYPE</Typography>
              <RadioGroup aria-label="brain_game_type" name="brain_game_type" value={brain_game_type ? brain_game_type : ''} onChange={e => handleChange(e.target.name, e.target.value)}>
                { game_type_list.map((game_type, index) => (
                  <Grid item xs={12} key={index}>
                    <FormControlLabel value={game_type._id} control={<Radio color="primary" />} label={game_type.game_type_name} style={{minWidth: 150}} />
                    <IconButtonEl1 edge="end" aria-label="delete" onClick={ e => {
                        removeBrainGameType(game_type._id);
                      }}>
                      <DeleteIcon />
                    </IconButtonEl1>
                  </Grid>
                ))}
              </RadioGroup>
              <List>
                <ListItem>
                  <TextField label=" 🧠" name="new_brain_game_type" margin="normal" fullWidth type="text" value={new_brain_game_type} onChange={e => updateTextField(e.target.name, e.target.value, 255)} />
                  <ListItemSecondaryAction>
                    <IconButtonEl edge="end" aria-label="add" onClick={ e => {
                      if (new_brain_game_type !== '') {
                        addBrainGameType(new_brain_game_type);
                        handleChange('new_brain_game_type', '');
                      }
                    }}>
                      <AddIcon />
                    </IconButtonEl>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={8}>
              <Grid item xs={12}>
                <Typography variant="h6">QUESTION</Typography>
                <TextField autoFocus={true} label="&nbsp;Are birds real?" name="question" margin="normal" fullWidth type="text" value={question} onChange={e => updateTextField(e.target.name, e.target.value, 255)} />
              </Grid>
              <Grid item xs={12} style={{marginTop: 50}}>
                <Grid item xs={6}>
                  <Typography variant="h6">CORRECT ANSWERS</Typography>
                  <List>
                    {answers.map((row, index) => (
                      <React.Fragment key={index}>
                        <ListItem key={index}>
                          <ListItemAvatar>
                            <Avatar>
                              <CommentIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={row} />
                          <ListItemSecondaryAction>
                            <IconButtonEl edge="end" aria-label="delete" onClick={ e => {
                              answers.splice(index, 1);
                              handleChange('answers', answers.slice(0));
                            }}>
                              <DeleteIcon />
                            </IconButtonEl>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                    <ListItem>
                      <TextField label="&nbsp;Yes" name="new_answer" margin="normal" fullWidth type="text" value={new_answer} onChange={e => updateTextField(e.target.name, e.target.value, 255)} />
                      <ListItemSecondaryAction>
                        <IconButtonEl edge="end" aria-label="add" onClick={ e => {
                          if (new_answer !== '') {
                            answers.push(new_answer)
                            handleChange('answers', answers)
                            handleChange('new_answer', '');
                          }
                        }}>
                          <AddIcon />
                        </IconButtonEl>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={6}>
                <Typography variant="h6">INCORRECT ANSWERS</Typography>
                <List>
                  {incorrect_answers.map((row, index) => (
                    <React.Fragment key={index}>
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar>
                            <CommentIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={row} />
                        <ListItemSecondaryAction>
                          <IconButtonEl edge="end" aria-label="delete" onClick={ e => {
                            incorrect_answers.splice(index, 1);
                            handleChange('incorrect_answers', incorrect_answers.slice(0));
                          }}>
                            <DeleteIcon />
                          </IconButtonEl>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                  <ListItem>
                    <TextField label="&nbsp;No" name="new_incorrect_answer" margin="normal" fullWidth type="text" value={new_incorrect_answer} onChange={e => updateTextField(e.target.name, e.target.value, 255)} />
                    <ListItemSecondaryAction>
                      <IconButtonEl edge="end" aria-label="add" onClick={ e => {
                        if (new_incorrect_answer !== '') {
                          incorrect_answers.push(new_incorrect_answer)
                          handleChange('incorrect_answers', incorrect_answers)
                          handleChange('new_incorrect_answer', '');
                        }
                      }}>
                        <AddIcon />
                      </IconButtonEl>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TopDiv>
        <ButtonDiv>
          <ButtonEl onClick={handelCancel} variant="contained" color="inherit" cancel="true">cancel</ButtonEl>
          {_id === "" || _id === undefined ? (
            <ButtonEl disabled={buttonDisable} type="submit" variant="contained" color="secondary">Submit</ButtonEl>
          ) : (
            <EditColumn>
              <DeleteButtonEl color="primary" onClick={setOnDelete} variant="contained">delete</DeleteButtonEl>
              <ButtonEl disabled={buttonDisable} onClick={onSaveForm} variant="contained" color="secondary">Save</ButtonEl>
            </EditColumn>
          )}
        </ButtonDiv>
      </FormEl>
    </PaperEl>
  );
}

const mapStateToProps = state => ({
  _id: state.questionReducer._id,
  question: state.questionReducer.question,
  brain_game_type: state.questionReducer.brain_game_type,
  new_brain_game_type: state.questionReducer.new_brain_game_type,
  answers: state.questionReducer.answers,
  new_answer: state.questionReducer.new_answer,
  incorrect_answers: state.questionReducer.incorrect_answers,
  new_incorrect_answer: state.questionReducer.new_incorrect_answer,
  game_type_list: state.questionReducer.game_type_list
});

const mapDispatchToProps = {
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestionEditForm);

const PaperEl = styled(Paper)`
  padding: 18px;
  margin-bottom: 12px;
`;

const FormEl = styled.form`
  display: flex;
  flex-direction: column;
`;

const TopDiv = styled.div`
  display: flex;
  justify-content: space-between;
`;
const ButtonDiv = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
`;

const EditColumn = styled.div`
  display: flex;
  justify-content: space-between;
  width: 180px;
  .MuiButton-containedPrimary {
    background-color: ${styleColor.error.main};
  }
`;
const DeleteButtonEl = styled(Button)``;

const ButtonEl = styled(Button)`
  span {
    color: ${({ cancel }) => (cancel ? styleColor.error.main : 'white')};
  }
`;

const IconButtonEl = styled(IconButton)`
  padding: 6px !important;
  margin-top: 18px !important;
`;

const IconButtonEl1 = styled(IconButton)`
  padding: 6px !important;
  margin-top: -8px !important;
`;
