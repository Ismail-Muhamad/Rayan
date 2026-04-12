export function loadCustomHeaders(tableId) {
  return localStorage.getItem(`customTableHeaders_${tableId}`);
}

export function saveCustomHeaders(tableId, headers) {
  localStorage.setItem(
    `customTableHeaders_${tableId}`,
    JSON.stringify(headers)
  );
}
