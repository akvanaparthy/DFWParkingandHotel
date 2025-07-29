// Utility function to normalize MongoDB data for frontend use
export const normalizeData = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(normalizeData);
  }

  if (typeof data === "object") {
    const normalized = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === "_id") {
        normalized.id = value;
      } else if (typeof value === "object" && value !== null) {
        normalized[key] = normalizeData(value);
      } else {
        normalized[key] = value;
      }
    }
    return normalized;
  }

  return data;
};

// Helper function to normalize API responses
export const normalizeApiResponse = (response) => {
  if (response?.data?.data) {
    response.data.data = normalizeData(response.data.data);
  }
  return response;
};
