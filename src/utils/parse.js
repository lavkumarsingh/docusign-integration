export function extractDocGenFormFields(apiResponse) {
  if (!apiResponse || !Array.isArray(apiResponse.documents)) {
    console.error("Invalid API response format");
    return [];
  }

  const firstDocument = apiResponse.documents[0];
  if (!firstDocument || !Array.isArray(firstDocument.docGenFormFields)) {
    console.warn("No docGenFormFields found in document");
    return [];
  }

  return firstDocument.docGenFormFields;
}
