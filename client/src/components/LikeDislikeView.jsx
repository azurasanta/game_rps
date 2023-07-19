// LikeDislikeView.js
import {IconButton, Typography} from '@material-ui/core';
import React from 'react';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import VisibilityIcon from '@material-ui/icons/Visibility';

export const LikeDislikeView = ({ row, user, handleLike, handleDislike, handleView }) => {
  return (
    <div>
      <div id="view">
        <VisibilityIcon style={{ fontSize: '1rem' }} />
        <Typography variant="body1">
          {row.views?.length || 0}
        </Typography>
      </div>

      <div>
        <IconButton onClick={() => handleLike(row)}>
          {row.likes?.includes(user.id) ? (
            <span role="img" aria-label="Thumbs up">
              &#x1F44D;
            </span>
          ) : (
            <ThumbUpIcon style={{ fontSize: '1rem' }} />
          )}
        </IconButton>
        <Typography variant="body1">
          {row.likes?.length || 0}
        </Typography>
      </div>
      <div>
        <IconButton onClick={() => handleDislike(row)}>
          {row.dislikes?.includes(user.id) ? (
            <span role="img" aria-label="Thumbs down">
              &#x1F44E;
            </span>
          ) : (
            <ThumbDownIcon style={{ fontSize: '1rem' }} />
          )}
        </IconButton>
        <Typography variant="body1">
          {row.dislikes?.length || 0}
        </Typography>
      </div>
    </div>
  );
};
