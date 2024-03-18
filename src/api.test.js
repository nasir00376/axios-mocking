import axios from 'axios';
import { apiRequest } from './api';

// Mocking axios
jest.mock('axios', () => jest.createMockFromModule('axios'));

describe('apiRequest', () => {
  it('should make an API request and return data', async () => {
    // Mocking axios response
    axios.mockResolvedValueOnce({ data: { message: 'Mocked response' } });

    const data = await apiRequest('/todos');

    expect(data).toEqual({ message: 'Mocked response' });
    expect(axios).toHaveBeenCalledWith('/todos', {});
  });

  it('should handle API request failure', async () => {
    // Mocking axios error
    axios.mockRejectedValueOnce(new Error('API request failed'));

    await expect(apiRequest('/todos')).rejects.toThrow('API request failed');
    expect(axios).toHaveBeenCalledWith('/todos', {});
  });

  it('should handle mocked error response', async () => {
    // Mocking axios response with error
    const mockError = {
      response: {
        status: 400,
        data: { message: 'Mocked error' }
      }
    };
    axios.mockRejectedValueOnce(new Error(mockError));
  
    await expect(apiRequest('/todos')).rejects.toThrow();
    expect(axios).toHaveBeenCalledWith('/todos', {});
  });
});
