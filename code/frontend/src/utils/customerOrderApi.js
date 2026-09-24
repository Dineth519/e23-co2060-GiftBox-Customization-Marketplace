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
    let message = failureMessage;
    try {
      message = (await response.text()) || failureMessage;
    } catch {
      // Keep the stable user-facing message when the server has no readable body.
    }
    throw new Error(message);
  }
  return response;
}

export const placeStandardOrder = payload =>
  placeOrder('/api/orders/standard', payload, 'Failed to place order');

export const placeCustomBoxOrder = payload =>
  placeOrder('/api/orders/custom-box', payload, 'Failed to place order');
