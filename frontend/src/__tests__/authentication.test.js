import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('Authentication Component', () => {
  it('renders correctly', () => {
    render(<Authentication />);
    expect(screen.getByTestId('authentication-container')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const mockFetch = jest.requireMock('node-fetch');
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ token: 'test-token' }),
    });

    render(<Authentication />);
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('https://api.ainative.studio/api/v1/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });
    });
  });

  it('shows loading state during login attempt', async () => {
    const mockFetch = jest.requireMock('node-fetch');
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<Authentication />);
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/loading\.\.\./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('handles API errors', async () => {
    const mockFetch = jest.requireMock('node-fetch');
    mockFetch.mockRejectedValueOnce(new Error('API error'));

    render(<Authentication />);
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/error: api error/i)).toBeInTheDocument();
    });
  });

  it('is accessible', () => {
    const { container } = render(<Authentication />);
    expect(container).toHaveAccessibleName(/authentication/i);
    expect(screen.getByLabelText(/email/i)).toHaveAccessibleDescription(/enter your email/i);
    expect(screen.getByLabelText(/password/i)).toHaveAccessibleDescription(/enter your password/i);
    expect(screen.getByRole('button', { name: /login/i })).toBeEnabled();
  });
});