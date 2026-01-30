export const classifyApiError = (err) => {
  const status = err?.response?.status;
  const code = err?.code;
  const message = (err?.message || '').toString().toLowerCase();

  if (!err?.response) {
    if (code === 'ECONNABORTED' || message.includes('timeout')) return 'timeout';
    return 'network';
  }

  if (status === 401 || status === 403) return 'permission';
  if (status === 404) return 'missing';
  if (status === 408) return 'timeout';

  return 'unknown';
};

export const apiErrorMessage = (err, fallback = 'Request failed') => {
  return err?.response?.data?.error || err?.response?.data?.message || err?.message || fallback;
};
