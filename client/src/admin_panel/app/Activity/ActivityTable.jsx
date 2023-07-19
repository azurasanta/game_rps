import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { PaperEl } from '../../../Styles/Elements/ToolsEl';
import Paper from '@material-ui/core/Paper';
import { centerEl } from '../../../Styles/Mixins';
import { styleColor } from '../../../Styles/styleThem';
import {
  warningMsgBar,
  infoMsgBar
} from '../../../redux/Notification/notification.actions';

import {acPaginationActivity} from '../../../redux/Customer/customer.action';
import Pagination from 'material-ui-flat-pagination';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';

function ActivityTable({
  data,
  acPaginationActivity,
  pages,
  page,
  total,
  loading
}) {
  return (
    <PaperEl elevation={3}>
      <TopTopHeaderEl>
        <AddAndTotal>
          <TotalDivEl>
            <Typography variant="subtitle2">Total</Typography>
            <Paper>{total}</Paper>
          </TotalDivEl>
        </AddAndTotal>
        <PaginationEl
          limit={1}
          offset={page - 1}
          total={pages}
          onClick={(e, offset) => {
            acPaginationActivity(10, offset + 1);
          }}
        />
      </TopTopHeaderEl>
      <HeaderRowEl>
        <ItemElID>id</ItemElID>
        <ItemEl>name</ItemEl>
        <ItemEl>activity</ItemEl>
        <ItemEl>amount</ItemEl>
        <ItemEl>date</ItemEl>
      </HeaderRowEl>
      <BottomDivEl>
        {!loading ? (
          data.map((row, index) => (
            <BottomRowEl key={row._id}>
              <ItemElID>{(page - 1) * 10 + index + 1}</ItemElID>
              <ItemEl>{row.username}</ItemEl>
              <ItemEl>{row.description}</ItemEl>
              <ItemEl>{row.amount}</ItemEl>
              <ItemEl>{row.created_at}</ItemEl>
            </BottomRowEl>
          ))
        ) : (
          <LinearProgress color="secondary" />
        )}
      </BottomDivEl>
    </PaperEl>
  );
}

const mapStateToProps = state => ({
  data: state.customerReducer.activities,
  pages: state.customerReducer.activity_pages,
  page: state.customerReducer.activity_page,
  loading: state.customerReducer.loading,
  total: state.customerReducer.totalActivities
});

const mapDispatchToProps = {
  warningMsgBar,
  infoMsgBar,
  acPaginationActivity
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivityTable);

const AddAndTotal = styled.div`
  display: flex;
  button {
    margin-right: 12px;
  }
`;

const TotalDivEl = styled.div`
  display: flex;
  align-items: center;
  h6 {
    margin-right: 6px;
  }
  div {
    padding: 3px 9px;
    background-color: #ffffff1f;
    color: ${styleColor.secondary.main};
  }
`;

const PaginationEl = styled(Pagination)`
  .MuiFlatPageButton-root:not(:first-child):not(:last-child) {
    background-color: #ffffff1f;
  }

  .MuiFlatPageButton-root:not(:first-child) {
    margin-left: 5px;
  }
`;

const TopTopHeaderEl = styled.div`
  margin: 12px 0;
  display: flex;
  justify-content: space-between;
`;

const RowEl = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  padding: 12px 21px;
`;

const HeaderRowEl = styled(RowEl)`
  background: linear-gradient(
    90deg,
    rgba(252, 251, 253, 0) 0%,
    rgb(139, 138, 231, 0.404) 2%,
    rgba(139, 138, 231, 0.404) 98%,
    rgba(255, 255, 255, 0) 100%
  );

  border-bottom: rgba(245, 245, 245, 0.2) solid 2px;
  border-radius: 3px;
  border-top: rgba(245, 245, 245, 0.2) solid 2px;
  padding: 6px 21px;
  font-weight: 700;
  div {
    transition: all 0.2s ease-in-out;
    text-transform: uppercase;
    &:hover {
      color: ${styleColor.secondary.lite};
      cursor: pointer;
    }
  }
`;

const BottomDivEl = styled.div`
  max-height: 70vh;
  overflow: auto;
`;
const BottomRowEl = styled(RowEl)`
  color: rgba(245, 245, 245, 0.5);
  &:hover {
    cursor: pointer;
  }
  &:nth-of-type(even) {
    background-color: #7574c03b;
    border-radius: 3px;
  }
`;

const ItemElID = styled.div`
  ${centerEl};
  width: 50px;
  button {
    transition: all 0.3s ease-in-out;
    padding: 6px;
    color: rgba(255, 255, 255, 0.5);
    &:hover {
      color: rgba(255, 255, 255, 1);
    }
  }
  path {
  }
`;

const ItemEl = styled.div`
  ${centerEl};
  width: 200px;
  button {
    transition: all 0.3s ease-in-out;
    padding: 6px;
    color: rgba(255, 255, 255, 0.5);
    &:hover {
      color: rgba(255, 255, 255, 1);
    }
  }
  path {
  }
`;
