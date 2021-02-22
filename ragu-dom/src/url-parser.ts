export const parseURL = (url: string) => {
  const urlObject = new URL(url);

  return {
    url,
    extension: getExtension(urlObject),
    props: getParams(urlObject)
  }
}

const getExtension = (url: URL) => {
  const beforeHashAndQueryParamsURL = url.pathname;
  const splitByDotURL = beforeHashAndQueryParamsURL.split('.');

  if (splitByDotURL.length === 1) {
    return undefined;
  }

  return splitByDotURL?.pop()?.trim();
};

const getParams = (url: URL) => {
  const params: Record<string, string> = {};

  url.searchParams.forEach(((value, key) => {
    params[key] = value;
  }));

  return params;
}
