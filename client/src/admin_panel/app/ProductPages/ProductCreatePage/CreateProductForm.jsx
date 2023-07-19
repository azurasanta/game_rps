import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import { styleColor } from '../../../../Styles/styleThem';
import Upload from './upload/Upload';
import Grid from '@material-ui/core/Grid';
import {MuiPickersUtilsProvider, KeyboardDateTimePicker} from '@material-ui/pickers';
import { connect } from 'react-redux';

function CreateProductForm({
  _id,
  productName,
  price,
  startDateTime,
  expireDateTime,
  onSubmitFrom,
  updateTextField,
  handleChange,
  buttonDisable,
  handelCancel,
  onSaveForm,
  setOnDelete
}) {
  function handleStartDateChange(date) {
    handleChange("startDateTime", date)
  }

  function handleExpireDateChange(date) {
    handleChange("expireDateTime", date)
  }

  return (
    <PaperEl elevation={12}>
      <FormEl onSubmit={e => onSubmitFrom(e)}>
        <TopDiv>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Upload />
            </Grid>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    autoFocus={true}
                    label="Title"
                    name="productName"
                    margin="normal"
                    type="text"
                    value={productName}
                    onChange={e => updateTextField(e.target.name, e.target.value, 25)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="price"
                    margin="normal"
                    type="number"
                    value={price}
                    onChange={e => updateTextField(e.target.name, e.target.value, 7)}
                  />
                </Grid>
              </Grid>
              <MuiPickersUtilsProvider>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <KeyboardDateTimePicker
                      disableToolbar
                      variant="inline"
                      format="yyyy-MM-dd HH:mm"
                      margin="normal"
                      name="startDateTime"
                      label="Start Date & Time"
                      value={startDateTime}
                      onChange={handleStartDateChange}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <KeyboardDateTimePicker
                      disableToolbar
                      variant="inline"
                      format="yyyy-MM-dd HH:mm"
                      margin="normal"
                      label="Expire Date & Time"
                      name="expireDateTime"
                      value={expireDateTime}
                      onChange={handleExpireDateChange}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                    />
                  </Grid>
                </Grid>
              </MuiPickersUtilsProvider>  
            </Grid>
          </Grid>
        </TopDiv>
        <ButtonDiv>
          <ButtonEl
            onClick={handelCancel}
            variant="contained"
            color="inherit"
            cancel="true"
          >
            cancel
          </ButtonEl>
          {_id === "" || _id === undefined ? (
            <ButtonEl
              disabled={buttonDisable}
              type="submit"
              variant="contained"
              color="secondary"
            >
              Submit
            </ButtonEl>
          ) : (
            <EditColumn>
              <DeleteButtonEl
                color="primary"
                onClick={setOnDelete}
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
          )}
        </ButtonDiv>
      </FormEl>
    </PaperEl>
  );
}

const mapStateToProps = state => ({
  _id: state.itemReducer._id,
  productName: state.itemReducer.productName,
  price: state.itemReducer.price,
  image: state.itemReducer.image,
  startDateTime: state.itemReducer.startDateTime,
  expireDateTime: state.itemReducer.expireDateTime
});

const mapDispatchToProps = {
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateProductForm);

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
