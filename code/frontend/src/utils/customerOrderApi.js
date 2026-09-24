export async function getOrderErrorMessage(response, fallbackMessage) {
  try {
    const body = await response.text();
    if (!body) return fallbackMessage;
    try {
      const error = JSON.parse(body);
      return error.message || error.error || fallbackMessage;
    } catch {
      return body;
    }
  } catch {
    return fallbackMessage;
  }
}

async function placeOrder(path, payload, failureMessage) {
  const response = await fetch(`${process.env.REACT_APP_API_URL || ''}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getOrderErrorMessage(response, failureMessage));
  }
  return response;
}

export const placeStandardOrder = payload =>
  placeOrder('/api/orders/standard', payload, 'Failed to place order');

export const placeCustomBoxOrder = payload =>
  placeOrder('/api/orders/custom-box', payload, 'Failed to place order');
