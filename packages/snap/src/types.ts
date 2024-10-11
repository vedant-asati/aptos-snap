export type StateData = {
  [key: string]: string;
};

export type RequestParams = {
  key: string;
  value: string;
};

export type SnapRequest = {
  params?: RequestParams;
};

export type Operation = 'setData' | 'getData' | 'clearData';

export type Handler = (
  request: SnapRequest,
  operation: Operation,
) => Promise<any>;
