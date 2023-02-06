import React from 'react';
import styled, { keyframes } from 'styled-components';

const beat = keyframes`
  {
    0%   { transform: scale(1); }
    10%  { transform: scale(1.1); }
    20%  { transform: scale(1); }
    40%  { transform: scale(1); }
    47%  { transform: scale(1.1); }
    55%  { transform: scale(1); }
    62%  { transform: scale(1.1); }
    69%  { transform: scale(1); }
    100% { transform: scale(1); }
  }
`;

const LoadingComponentWrapper = styled.span`
  display: flex;
  flex-direction: column;
  place-items: center center;
  font-family: Arial, Helvetica, sans-serif;
  color: white;
`;

const HeartBeat = styled.div`
  width: 80px;
  animation: 3s linear 0s normal none infinite ${beat};
`;

export const LoadingComponent: React.FC = () => {
  return (
    <LoadingComponentWrapper>
      <HeartBeat>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path
            d="M34.167 972.362c-11.42 0-19.167 8.92-19.167 20.27 0 19.46 15 27.568 35 39.73 20-12.162 35-20.27 35-39.73 0-11.35-7.747-20.27-19.167-20.27-7.35 0-13.391 4.054-15.833 6.487-2.442-2.433-8.483-6.487-15.833-6.487z"
            fill="transparent"
            stroke="#39c4d8"
            strokeWidth="5"
            overflow="visible"
            transform="translate(0 -952.362)"
          />
        </svg>
      </HeartBeat>
      <span>Loading beats...</span>
    </LoadingComponentWrapper>
  );
};
