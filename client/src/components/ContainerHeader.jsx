import React from 'react';
import styled from 'styled-components';
import { below } from '../Styles/Mixins';
import Paper from '@material-ui/core/Paper';

const ContainerHeader = ({ title, match }) => {
  document.title = title.toUpperCase();
  return (
    <PaperEl elevation={12}>
      <h1>{title}</h1>
    </PaperEl>
  );
};

export default ContainerHeader;

const PaperEl = styled(Paper)`
  grid-area: ContainerHeader;
  padding: 8px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;

  h1 {
    margin-bottom: 0;
    font-weight: 800;
    min-width: 200px;
  }
  ol {
    ${below.phone`
       display:none;
    `}
  }
`;