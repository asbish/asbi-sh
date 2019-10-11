export const preCacheList = ['favicon.ico'];

export const isRuntimeCache = (pathname: string) => {
  return pathname.startsWith('/assets/');
};
