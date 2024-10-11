import { RequestParams, StateData } from './types';

export async function setData(data) {
  const persistedData = await getData();
  const newData = { ...persistedData, [data.key]: data.value };
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState: newData,
    },
  });

  return { message: 'Data saved successfully' };
}

export async function getData() {
  const persistedData =
    (await snap.request({
      method: 'snap_manageState',
      params: { operation: 'get' },
    })) || {};

  return persistedData;
}

export async function clearData() {
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'clear',
    },
  });

  return { message: 'Data cleared successfully' };
}
