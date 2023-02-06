import { useReducer, useState, useEffect, useCallback } from 'react';

type ColumnsHeaders = string[];

export type BeatType = {
  time: number;
  voltage: number;
};

type ChannelType = number;

type BeatsType = Record<ChannelType, BeatType[]>;

type ChunkType = {
  columnsHeaders: ColumnsHeaders;
  beats: BeatsType;
  chunks: number;
  loading: boolean;
};

type PoolingType = {
  time: number;
  range: number;
};

type IsPoolingType = {
  loop: number;
  state: boolean;
  next: number;
  done: boolean;
};

type ActionType = {
  type: string;
};

type SetChunkBeatsActionType = ActionType & {
  type: 'SET_CHUNK_BEATS';
  payload: BeatsType;
};

type SetChunkHeadersActionType = ActionType & {
  type: 'SET_CHUNK_COLUMNS_HEADERS';
  payload: ColumnsHeaders;
};

type SetChunksNumberActionType = ActionType & {
  type: 'SET_CHUNKS_NUMBER';
  payload: number;
};

type SetChunkLoadingActionType = ActionType & {
  type: 'SET_CHUNK_LOADING';
  payload: boolean;
};

type SetIsPoolingActionType = ActionType & {
  type: 'SET_IS_POOLING';
  payload: IsPoolingType;
};

type SetIsPoolingLoopActionType = ActionType & {
  type: 'SET_IS_POOLING_LOOP';
  payload: number;
};

type SetIsPoolingStateActionType = ActionType & {
  type: 'SET_IS_POOLING_STATE';
  payload: boolean;
};

type SetIsPoolingNextActionType = ActionType & {
  type: 'SET_IS_POOLING_NEXT';
  payload: number;
};

let pullIntervalId: NodeJS.Timer;

export const usePullBeatsByChannelService = (
  filePath: string,
  startTime = 0,
  endTime = 2,
  pooling?: PoolingType
): ChunkType => {
  const isSetChunkBeatsAction = (
    action: ActionType
  ): action is SetChunkBeatsActionType => action.type === 'SET_CHUNK_BEATS';

  const isSetChunkColumnsHeadersAction = (
    action: ActionType
  ): action is SetChunkHeadersActionType =>
    action.type === 'SET_CHUNK_COLUMNS_HEADERS';

  const isSetChunkNumberAction = (
    action: ActionType
  ): action is SetChunksNumberActionType => action.type === 'SET_CHUNKS_NUMBER';

  const isSetChunkLoadingAction = (
    action: ActionType
  ): action is SetChunkLoadingActionType => action.type === 'SET_CHUNK_LOADING';

  const chunkReducer = (
    state: ChunkType,
    action:
      | SetChunkBeatsActionType
      | SetChunkHeadersActionType
      | SetChunksNumberActionType
      | SetChunkLoadingActionType
  ): ChunkType => {
    if (isSetChunkBeatsAction(action)) {
      return {
        ...state,
        beats: {
          ...action?.payload,
        },
      };
    }

    if (isSetChunkColumnsHeadersAction(action)) {
      return {
        ...state,
        columnsHeaders: action.payload,
      };
    }

    if (isSetChunkNumberAction(action)) {
      return {
        ...state,
        chunks: action.payload,
      };
    }

    if (isSetChunkLoadingAction(action)) {
      return {
        ...state,
        loading: action.payload,
      };
    }

    return { ...state };
  };

  const [chunkState, dispatchChunkAction] = useReducer(chunkReducer, {
    columnsHeaders: [] as ColumnsHeaders,
    beats: {} as BeatsType,
    chunks: 0,
    loading: false,
  });

  const isSetIsPoolingAction = (
    action: ActionType
  ): action is SetIsPoolingActionType => action.type === 'SET_IS_POOLING';

  const isSetIsPoolingLoopAction = (
    action: ActionType
  ): action is SetIsPoolingLoopActionType =>
    action.type === 'SET_IS_POOLING_LOOP';

  const isSetIsPoolingStateAction = (
    action: ActionType
  ): action is SetIsPoolingStateActionType =>
    action.type === 'SET_IS_POOLING_STATE';

  const isSetIsPoolingNextAction = (
    action: ActionType
  ): action is SetIsPoolingNextActionType =>
    action.type === 'SET_IS_POOLING_NEXT';

  const isPoolingReducer = (
    state: IsPoolingType,
    action:
      | SetIsPoolingActionType
      | SetIsPoolingLoopActionType
      | SetIsPoolingStateActionType
      | SetIsPoolingNextActionType
  ): IsPoolingType => {
    if (isSetIsPoolingAction(action)) {
      return {
        ...state,
        ...action?.payload,
      };
    }

    if (isSetIsPoolingLoopAction(action)) {
      return {
        ...state,
        loop: action?.payload,
      };
    }

    if (isSetIsPoolingStateAction(action)) {
      return {
        ...state,
        state: action?.payload,
      };
    }

    if (isSetIsPoolingNextAction(action)) {
      return {
        ...state,
        next: action?.payload,
      };
    }

    return { ...state };
  };

  const [isPooling, dispatchIsPoolingAction] = useReducer(isPoolingReducer, {
    loop: 0,
    state: false,
    next: endTime + 1,
    done: false,
  });

  const [fileReader, setFileReader] =
    useState<ReadableStreamDefaultReader<string>>();

  const parseVoltages = useCallback(
    (beats: BeatsType, beatVoltages: string[], beatTime: number): void => {
      beatVoltages.forEach((voltage, index: number) => {
        const channel = index + 1;

        const beat: BeatType = {
          time: beatTime,
          voltage: parseFloat(voltage),
        };

        if (beats && !(channel in beats)) {
          beats[channel] = [];
        }

        if (voltage && voltage !== '' && beats) {
          beats[channel].push(beat);
        }
      });
    },
    []
  );

  const parseColumnsHeaders = useCallback(
    (line: string) => {
      let columnsHeaders = [...chunkState.columnsHeaders];

      columnsHeaders = line.split(',');

      dispatchChunkAction({
        type: 'SET_CHUNK_COLUMNS_HEADERS',
        payload: columnsHeaders,
      });
    },
    [chunkState]
  );

  const parseLines = useCallback(
    (lines: string[]): void => {
      let startRange = startTime;
      let endRange = endTime;

      if (pooling && isPooling.state) {
        startRange = isPooling.next;
        endRange = isPooling.next + pooling?.range;
      }

      const beats = structuredClone(chunkState.beats);

      lines.forEach((line: string, index: number) => {
        // if it is not columns headers line
        if (index !== 0) {
          const values = line.split(',');
          const [time, ...voltages] = values;
          const timeFloat = parseFloat(time);

          // if time is out of range
          if (timeFloat > endRange) {
            return;
          }
          // if time is in range
          else if (timeFloat >= startRange && timeFloat <= endRange) {
            parseVoltages(beats, voltages, timeFloat);
          }
        } else {
          // if it is columns headers line and there are not columns headers set yet
          if (
            !chunkState.columnsHeaders ||
            chunkState.columnsHeaders.length === 0
          ) {
            parseColumnsHeaders(line);
          }
        }
      });

      dispatchChunkAction({
        type: 'SET_CHUNK_BEATS',
        payload: beats || {},
      });

      if (pooling && isPooling.state) {
        dispatchIsPoolingAction({
          type: 'SET_IS_POOLING',
          payload: {
            ...isPooling,
            loop: isPooling.loop + 1,
            next: endRange + pooling.range,
          },
        });
      }
    },
    [
      chunkState,
      startTime,
      endTime,
      parseVoltages,
      parseColumnsHeaders,
      isPooling,
      pooling,
    ]
  );

  const parseChunk = useCallback(
    async ({
      done,
      value,
    }: ReadableStreamReadResult<string>): Promise<string | undefined> => {
      if (done) {
        console.info('File is finished reading');

        clearInterval(pullIntervalId);

        dispatchIsPoolingAction({
          type: 'SET_IS_POOLING',
          payload: {
            ...isPooling,
            state: false,
            done: true,
          },
        });

        dispatchChunkAction({
          type: 'SET_CHUNK_LOADING',
          payload: false,
        });

        return;
      }

      dispatchChunkAction({
        type: 'SET_CHUNKS_NUMBER',
        payload: chunkState.chunks + 1,
      });

      const chunk = value;
      const lines = chunk.split('\n');

      parseLines(lines);

      if (fileReader) {
        // Read some more, and call this function again
        return fileReader.read().then(parseChunk);
      }
    },
    [fileReader, parseLines, isPooling, chunkState.chunks]
  );

  const readFile = useCallback(
    async (reader?: ReadableStreamDefaultReader<string>): Promise<void> => {
      if (!reader) {
        throw new Error('there is no file reader to pull stream data');
      }

      reader.read().then(parseChunk);
    },
    [parseChunk]
  );

  const getFileStream = useCallback(async (): Promise<
    ReadableStream | null | undefined
  > => {
    let response;

    try {
      response = await fetch(filePath);
    } catch (error) {
      throw new Error(`An error appears fetching the file to parse: ${error}`);
    }

    return response?.body;
  }, [filePath]);

  useEffect(() => {
    const startReadingBeats = async () => {
      let reader;

      if (!fileReader) {
        dispatchChunkAction({
          type: 'SET_CHUNK_LOADING',
          payload: true,
        });

        const fileStream = await getFileStream();

        if (fileStream) {
          reader = fileStream?.pipeThrough(new TextDecoderStream()).getReader();
          setFileReader(reader);
        }

        await readFile(reader);

        return;
      }

      if (
        pooling &&
        !isPooling.state &&
        isPooling.loop === 0 &&
        !isPooling.done
      ) {
        dispatchIsPoolingAction({
          type: 'SET_IS_POOLING_STATE',
          payload: true,
        });

        pullIntervalId = setInterval(async () => {
          await readFile(fileReader);

          dispatchIsPoolingAction({
            type: 'SET_IS_POOLING_LOOP',
            payload: isPooling.loop + 1,
          });
        }, pooling.time * 1000);
      }
    };

    startReadingBeats();
  }, [readFile, fileReader, getFileStream, pooling, isPooling]);

  return chunkState;
};
