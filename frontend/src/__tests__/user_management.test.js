import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

describe('UserManagement Component', () => {
  const mockFetch = global.fetch;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  test('renders correctly', async () => {
    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ email: 'test@example.com' }),
      ok: true,
    });

    render(<UserManagement />);
    await waitFor(() => expect(screen.getByTestId('user_management-container')).toBeInTheDocument());
    expect(screen.getByText(/User Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ email: 'test@example.com' }),
      ok: true,
    });

    render(<UserManagement />);
    await waitFor(() => expect(screen.getByTestId('user_management-container')).toBeInTheDocument());

    const updateButton = screen.getByRole('button', { name: /Update Email/i });
    userEvent.click(updateButton);

    const newEmailInput = screen.getByPlaceholderText(/New Email/i);
    userEvent.type(newEmailInput, 'newtest@example.com');

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    userEvent.click(submitButton);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.ainative.studio/api/v1/auth/update-email',
      expect.anything()
    );
  });

  test('shows loading state', async () => {
    mockFetch.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<UserManagement />);
    expect(screen.getByTestId('user_management-container')).toBeInTheDocument();
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument()
    );
  });

  test('handles API errors', async () => {
    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ error: 'API Error' }),
      ok: false,
    });

    render(<UserManagement />);
    await waitFor(() => expect(screen.getByTestId('user_management-container')).toBeInTheDocument());
    expect(screen.getByText(/Error: API Error/i)).toBeInTheDocument();
  });

  test('is accessible', async () => {
    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ email: 'test@example.com' }),
      ok: true,
    });

    render(<UserManagement />);
    await waitFor(() => expect(screen.getByTestId('user_management-container')).toBeInTheDocument());

    expect(screen.getByText(/User Information/i)).toHaveAttribute('aria-label', 'User Information');
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Email/i })).toBeEnabled();
  });
});