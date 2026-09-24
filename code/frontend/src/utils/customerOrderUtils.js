export const getProductId = product => product?.productId ?? product?.id ?? product?._id;

export function filterProducts(products, category = 'All', searchQuery = '') {
  const query = searchQuery.trim().toLowerCase();
  return products.filter(product => {
    const matchesCategory = category === 'All' || product.category === category;
    const matchesSearch = (product.name || '').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
}

export const countSelectedItems = selectedItems =>
  Object.values(selectedItems).reduce((total, quantity) => total + quantity, 0);

export function addSelectedItem(selectedItems, product, limit) {
  const productId = getProductId(product);
  if (productId == null || countSelectedItems(selectedItems) >= limit) return selectedItems;
  return {
    ...selectedItems,
    [productId]: (selectedItems[productId] || 0) + 1,
  };
}

export function removeSelectedItem(selectedItems, productId) {
  const updated = { ...selectedItems };
  if ((updated[productId] || 0) > 1) updated[productId] -= 1;
  else delete updated[productId];
  return updated;
}

export function trimSelectionToLimit(selectedItems, limit) {
  let total = countSelectedItems(selectedItems);
  if (total <= limit) return selectedItems;

  const updated = { ...selectedItems };
  const productIds = Object.keys(updated);
  for (let index = productIds.length - 1; index >= 0 && total > limit; index -= 1) {
    const productId = productIds[index];
    const removed = Math.min(updated[productId], total - limit);
    updated[productId] -= removed;
    total -= removed;
    if (updated[productId] <= 0) delete updated[productId];
  }
  return updated;
}

export function calculateItemsSubtotal(selectedItems, products) {
  return Object.entries(selectedItems).reduce((total, [productId, quantity]) => {
    const product = products.find(item => String(getProductId(item)) === String(productId));
    return total + (product ? Number(product.price) * quantity : 0);
  }, 0);
}

export function calculateBoxTotal(selectedItems, products, boxFee = 0, hasWaxSeal = false) {
  return calculateItemsSubtotal(selectedItems, products) + Number(boxFee || 0) + (hasWaxSeal ? 250 : 0);
}

export function validateCustomOrder({ selectedItems, recipientName, deliveryAddress }) {
  if (countSelectedItems(selectedItems) === 0) return 'Your gift box is empty! Add items in Step 3.';
  if (!recipientName?.trim()) return 'Please specify a recipient name.';
  if (!deliveryAddress?.trim()) return 'Please provide a complete delivery address.';
  return null;
}

export function buildStandardOrderPayload(customerId, deliveryAddress, cartItems) {
  return {
    customerId: Number(customerId),
    deliveryAddress: deliveryAddress.trim(),
    items: cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  };
}

export function buildCustomOrderPayload({
  customerId,
  occasion,
  boxSize,
  wrappingStyle,
  ribbonColor,
  hasWaxSeal,
  recipientName,
  senderName,
  giftMessage,
  cardTemplate,
  deliveryAddress,
  deliveryDate,
  totalPrice,
  selectedItems,
}) {
  return {
    customerId: Number(customerId),
    occasion,
    boxSize: boxSize.id,
    wrappingStyle: wrappingStyle.id,
    ribbonColor,
    hasWaxSeal,
    recipientName: recipientName.trim(),
    senderName,
    giftMessage,
    cardTemplate: cardTemplate.id,
    deliveryAddress: deliveryAddress.trim(),
    deliveryDate,
    totalPrice,
    items: Object.entries(selectedItems).map(([productId, quantity]) => ({
      productId: Number(productId),
      quantity,
    })),
  };
}
