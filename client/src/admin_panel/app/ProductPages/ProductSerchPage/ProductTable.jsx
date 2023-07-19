import React from 'react';
import { PaperEl } from '../../../../Styles/Elements/ToolsEl';
import { styleColor } from '../../../../Styles/styleThem';
import { connect } from 'react-redux';
import { acQueryItem, setCurrentProductId, setCurrentProductInfo } from '../../../../redux/Item/item.action';
import { centerEl } from '../../../../Styles/Mixins';
import history from '../../../../redux/history';
import styled from 'styled-components';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Pagination from 'material-ui-flat-pagination';
import LinearProgress from '@material-ui/core/LinearProgress';
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';

function ProductTable({
  data,
  pages,
  page,
  total,
  loading,
  acQueryItem,
  setCurrentProductId
}) {

  return (
    <PaperEl>
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
            acQueryItem(10, offset + 1);
          }}
        />
      </TopTopHeaderEl>
      <HeaderRowEl>
        <ItemEl>Product ID</ItemEl>
        <ItemEl>Product Name</ItemEl>
        <ItemEl>Price</ItemEl>
        <LargeItemEl>Start Date & Time</LargeItemEl>
        <LargeItemEl>Expire Date & Time</LargeItemEl>
        <ItemEl>Submit Date</ItemEl>
        <ItemEl>Action</ItemEl>
      </HeaderRowEl>
      <BottomDivEl>
        {!loading ? (data.map((row, index) => (
          <BottomRowEl
            key={row._id}
            onClick={(e) => {
              setCurrentProductId(row._id);
              history.push(`/admin/product/${row._id}`);
            }}
          >
            <ItemEl>{index + 1}</ItemEl>
            <ItemEl>{row.productName}</ItemEl>
            <ItemEl>${row.price} USD</ItemEl>
            <LargeItemEl>{row.startDateTime}</LargeItemEl>
            <LargeItemEl>{row.expireDateTime}</LargeItemEl>
            <ItemEl>{row.date}</ItemEl>
            <ItemEl>
              <Tooltip title="View">
                <IconButton onClick={(e) => {
                  setCurrentProductInfo({image: ''});
                  setCurrentProductId(row._id);
                  history.push(`/admin/product/${row._id}`);
                }}>
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </ItemEl>
          </BottomRowEl>
        ))) : (
          <LinearProgress color="secondary" />
        )}
      </BottomDivEl>
    </PaperEl>
  );
}

const mapStateToProps = state => ({
  data: state.itemReducer.itemArray,
  pages: state.itemReducer.pages,
  page: state.itemReducer.page,
  loading: state.itemReducer.loading,
  total: state.itemReducer.totalResults
});

const mapDispatchToProps = {
  acQueryItem,
  setCurrentProductId,
  setCurrentProductInfo
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductTable);

const TopTopHeaderEl = styled.div`
  margin: 12px 0;
  display: flex;
  justify-content: space-between;
`;

const AddAndTotal = styled.div`
  display: flex;
  button {
    margin-right: 12px;
  }
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
  height: 70vh;
  overflow: auto;
`;
const BottomRowEl = styled(RowEl)`
  color: rgba(245, 245, 245, 0.5);
  &:nth-of-type(even) {
    background-color: #7574c03b;
    border-radius: 3px;
  }
  &:hover div {
    cursor: pointer;
    color: ${styleColor.secondary.main};
  }
`;

const ItemEl = styled.div`
  ${centerEl};
  width: 110px;
  overflow: hidden;
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

const LargeItemEl = styled(ItemEl)`
  width: 150px;
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
