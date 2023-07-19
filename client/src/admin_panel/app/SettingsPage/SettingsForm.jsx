import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import { styleColor } from '../../../Styles/styleThem';
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux';

function SettingsForm({
  commission,
  onSubmitFrom,
  handleChange,
}) {
  return (
    <PaperEl elevation={12}>
      <FormEl onSubmit={e => onSubmitFrom(e)}>
        <TopDiv>
          <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                    label="Commission(%)"
                    name="commission"
                    margin="normal"
                    type="number"
                    value={commission}
                    onChange={handleChange}
                />
            </Grid>
          </Grid>
        </TopDiv>
        <ButtonDiv>
            <ButtonEl
              type="submit"
              variant="contained"
              color="secondary"
            >
              Save
            </ButtonEl>
        </ButtonDiv>
      </FormEl>
    </PaperEl>
  );
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = {
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsForm);

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

const ButtonEl = styled(Button)`
  span {
    color: ${({ cancel }) => (cancel ? styleColor.error.main : 'white')};
  }
`;
