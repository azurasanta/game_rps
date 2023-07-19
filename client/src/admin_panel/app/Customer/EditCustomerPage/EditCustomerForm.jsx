import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import { styleColor } from '../../../../Styles/styleThem';
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux';
import FormLabel from '@material-ui/core/FormLabel';

function EditCustomerForm({
  _id,
  balance,
  avatar,
  bio,
  email,
  username,
  onSubmitFrom,
  handleChange,
  buttonDisable,
  handleCancel,
  is_banned,
  onSaveForm,
  onDelete,
  onRestore
}) {
  return (
    <PaperEl elevation={12}>
      <FormEl onSubmit={e => onSubmitFrom(e)}>
        <TopDiv>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Avatar
                src={avatar ? avatar : '/img/profile-thumbnail.svg'}
                alt=""
              />
            </Grid>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={2}>
                  <FormLabel>Username: </FormLabel>
                </Grid>
                <Grid item xs={10}>
                  <FormLabel>{username}</FormLabel>
                </Grid>
                <Grid item xs={2}>
                  <FormLabel>Email: </FormLabel>
                </Grid>
                <Grid item xs={10}>
                  <FormLabel>{email}</FormLabel>
                </Grid>
                <Grid item xs={2}>
                  <FormLabel>Bio: </FormLabel>
                </Grid>
                <Grid item xs={10}>
                  <FormLabel>{bio}</FormLabel>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Balance"
                    name="balance"
                    margin="normal"
                    type="number"
                    value={balance}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TopDiv>
        <ButtonDiv>
          <ButtonEl
            onClick={handleCancel}
            variant="contained"
            color="inherit"
            cancel="true"
          >
            cancel
          </ButtonEl>
          {_id === '' || _id === undefined ? (
            <ButtonEl
              disabled={buttonDisable}
              type="submit"
              variant="contained"
              color="secondary"
            >
              Submit
            </ButtonEl>
          ) : !is_banned ? (
            <EditColumn>
              <DeleteButtonEl
                color="primary"
                onClick={onDelete}
                variant="contained"
              >
                delete
              </DeleteButtonEl>
              <ButtonEl
                onClick={onSaveForm}
                variant="contained"
                color="secondary"
              >
                Save
              </ButtonEl>
            </EditColumn>
          ) : (
            <EditColumn>
              <ButtonEl
                onClick={onRestore}
                variant="contained"
                color="secondary"
              >
                Restore
              </ButtonEl>
            </EditColumn>
          )}
        </ButtonDiv>
      </FormEl>
    </PaperEl>
  );
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(EditCustomerForm);

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

const Avatar = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 10px;
`;
