import axios from "axios";

/**
 * Define mock responses and errors for different API endpoints
 * @type {Object.<string, { todos: Array.<Object>}>}
 */
const mockResponses = {
  "/todos": {
    todos: [
      {
        id: 1,
        todo: "Do something nice for someone I care about",
        completed: true,
        userId: 26,
      },
      {
        id: 2,
        todo: "Memorize the fifty states and their capitals",
        completed: false,
        userId: 48,
      },
    ],
  },
  // Add more endpoints as needed
};

export const mockingEnabled = process.env.NODE_ENV === "development" || process.env.NODE_ENV === 'test';

/**
 * Define mock errors for different API endpoints
 * @type {Object.<string, { status: number, message: string }>}
 */
const mockErrors = {
  "/todos": { status: 400,  message: "Mocked error message" },
  // Add more error endpoints as needed
};

/**
 * Determines if the given URL is mocked
 * @param {string} url - The URL to check
 * @returns {boolean} True if the URL is mocked, otherwise false
 */
const isUrlMocked = (url) => url in mockResponses;

/**
 * Generates a mock error response or data for a given URL
 * @param {Object} config - Axios request config
 * @returns {Promise} A promise resolving to a mock error response or data
 */
const getMockError = (config) => {
  const mockError = new Error();

  mockError.mockData = config?.options?.mockError
    ? mockErrors[config.url]
    : mockResponses[config.url];

  mockError.config = config;

  return Promise.reject(mockError);
};

/**
 * Checks if the given error is a mock error
 * @param {Error} error - The error to check
 * @returns {boolean} True if the error is a mock error, otherwise false
 */
const isMockError = (error) => Boolean(error.mockData);

/**
 * Generates a mock response for the given mock error
 * @param {Error} mockError - The mock error
 * @returns {Promise} A promise resolving to a mock response
 */
const getMockResponse = (mockError) => {
  const { mockData, config } = mockError;

  if (mockData.status && String(mockData.status)[0] !== "2") {
    const err = new Error(mockData.message || "mock error");
    err.code = mockData.status;
    return Promise.reject(err);
  }

  return Promise.resolve({
    data: mockData,
    status: 200,
    statusText: "OK",
    headers: {},
    config,
    isMock: true,
  });
};

axios.interceptors.request.use(
  (config) => {
    console.log("test::", mockingEnabled)
    if ( mockingEnabled && isUrlMocked(config.url)) {
      console.log("debug:: axios mocking " + config.url);
      return getMockError(config);
    }
    config.baseURL = config.options?.baseUrl || "https://dummyjson.com";
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isMockError(error)) {
      return getMockResponse(error);
    }
    return Promise.reject(error);
  }
);

/**
 * Makes an API request using Axios
 * @param {string} url - The URL for the request
 * @param {Object} [options] - Axios request options
 * @returns {Promise} A promise resolving to the API response data
 */
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await axios(url, options);
    return response.data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};
