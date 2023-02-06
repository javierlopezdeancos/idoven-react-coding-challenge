import { FC } from 'react';
import { ElectroCardiogramComponent } from './electro-cardiogram/components/ElectroCardiogramComponent';
import styled from 'styled-components';

import './app.css';

const AppComponentWrapperComponent = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: black;
  padding: 0;
  margin: 0;
`;

export const App: FC = (): JSX.Element => {
  return (
    <AppComponentWrapperComponent>
      <ElectroCardiogramComponent />
    </AppComponentWrapperComponent>
  );
};

export default App;
