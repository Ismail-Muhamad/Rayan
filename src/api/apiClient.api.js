import axiosClient from "./axiosClient";

// Retrieve the default API version from environment variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

class APIClient {
  constructor(resource = "", options = {}) {
    // Properties:
    // Properties:
    // Initialize API version, using provided version or default
    // this.apiVersion = `/api/${options.apiVersion || DEFAULT_API_VERSION}`;
    // Store the name of the resource
    this.resource = resource;
    // Store additional options
    this.options = options;
  }

  // Getters:
  // Getter method to compute the base URL for API requests
  get url() {
    // Compose the base URL using environment variable for API URL, API version, and resource name
    return `${BASE_URL}${this.resource ? `/${this.resource}` : ""}`;
  }

  // Method to get url with an optional resource override
  getUrl(baseResource = "") {
    const handledResource = baseResource
      ? `/${baseResource}`
      : `/${this.resource}`;
    return `${BASE_URL}${handledResource}`;
  }

  // Methods:
  // Method for sending GET requests
  get(params = {}, resource = "") {
    // Send a GET request using Axios
    const handledResource = resource && `/${resource}`;
    return axiosClient.get(`${this.url}${handledResource}`, { params });
  }

  // Method for sending GET request to retrieve a specific resource item
  show(id, params = {}, resource = "") {
    // const handledId = id && `${id}`;
    const handledId = id && `/${id}`;
    const handledResource = resource && `/${resource}`;
    // Send a GET request to retrieve a specific resource item by ID
    return axiosClient.get(`${this.url}${handledResource}${handledId}`, {
      params,
    });
  }

  // Method for sending POST requests to create new resource items
  create(data, params = {}, resource = "") {
    // Send a POST request to create a new resource item
    const handledResource = resource && `/${resource}`;
    return axiosClient.post(`${this.url}${handledResource}`, data, { params });
  }

  // Method for sending PATCH requests to update existing resource items
  update(id, data, params = {}, resource = "") {
    // Send a PATCH request to update an existing resource item
    // `${this.url}/${id}`
    const handledId = id && `/${id}`;
    // const handledId = id && `${id}`;
    const handledResource = resource && `/${resource}`;
    return axiosClient.patch(
      `${this.url}${handledResource}${handledId}`,
      data,
      {
        params,
      },
    );
  }
  replace(id, data, params = {}, resource = "") {
  const handledId = id && `/${id}`;
  const handledResource = resource && `/${resource}`;

  return axiosClient.put(
    `${this.url}${handledResource}${handledId}`,
    data,
    {
      params,
    },
  );
}

  // Method for sending DELETE requests to delete resource items
  delete(id, params = {}, resource = "") {
    // Build the resource path
    const handledResource = resource ? `/${resource}` : "";
    const handledId = id ? `/${id}` : "";
    // Compose the full URL
    const url = `${this.url}${handledResource}${handledId}`;
    // Send DELETE request with params as query string
    return axiosClient.delete(url, { params });
  }

  // Method for sending GET requests with filters
  filter(params = {}, resource = "") {
    const handledResource = resource && `/${resource}`;
    return axiosClient.get(`${this.url}${handledResource}`, { params });
  }
}

export default APIClient;
