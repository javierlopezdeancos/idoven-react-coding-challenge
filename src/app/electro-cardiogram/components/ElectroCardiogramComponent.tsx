import { useMemo, FC, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { usePullBeatsByChannelService } from '../services/usePullBeatsByChannelService';
import { LoadingComponent } from '../../loading/LoadingComponent';
import styled from 'styled-components';

const ElectroCardiogramWrapperComponent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & > div {
    width: 100vw;
    height: 100vh;
  }
`;

export const ElectroCardiogramComponent: FC = (): JSX.Element => {
  const { beats, loading } = usePullBeatsByChannelService(
    'example3.csv',
    0,
    50,
    {
      time: 1,
      range: 261,
    }
  );

  const options: Highcharts.Options = useMemo(
    () => ({
      title: {
        text: '',
      },
      series: [
        {
          type: 'line',
          name: 'Channel 1',
          data: beats[1]?.map((beat): number => beat?.voltage),
          color: '#39c4d8',
        },
      ],
      chart: {
        backgroundColor: 'black',
        width: null,
        height: null,
        zooming: {
          type: 'xy',
          resetButton: {
            position: {
              align: 'right',
            },
          },
        },
      },
      plotOptions: {
        line: {
          lineWidth: 1,
        },
      },
      xAxis: [
        {
          title: {
            text: 'Time',
          },
          gridLineColor: '#3c3c3c',
          minorGridLineColor: '#3c3c3c',
          minorGridLineDashStyle: 'Solid',
          minorGridLineWidth: 0,
          gridLineWidth: 1,
        },
      ],
      yAxis: [
        {
          title: {
            text: 'Voltages',
          },
          gridLineColor: '#5b5b5b',
        },
      ],
      accessibility: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
    }),
    [beats]
  );

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  return (
    <ElectroCardiogramWrapperComponent>
      {loading && <LoadingComponent />}
      {!loading && beats && Object.keys(beats).length !== 0 && (
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          ref={chartComponentRef}
        />
      )}
    </ElectroCardiogramWrapperComponent>
  );
};
