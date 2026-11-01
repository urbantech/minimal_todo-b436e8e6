import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('https://api.ainative.studio', () => ({
  fetch: jest.fn(),
}));

const mockFetch = global.fetch;

beforeEach(() => {
  mockFetch.mockReset();
});

afterEach(() => {
  mockFetch.mockRestore();
});

describe('CompleteToDo Component', () => {
  const mockTodo = { id: 1, title: 'Test Todo', completed: false };

  it('renders correctly', () => {
    render(<CompleteToDo todo={mockTodo} />);
    expect(screen.getByTestId('complete_to_do-container')).toBeInTheDocument();
    expect(screen.getByText(mockTodo.title)).toBeInTheDocument();
  });

  it('handles checkbox interaction', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ ...mockTodo, completed: true }),
    });

    render(<CompleteToDo todo={mockTodo} />);
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.ainative.studio/api/v1/todos/${mockTodo.id}`,
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'X-API-Key': expect.any(String),
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ completed: true }),
        })
      );
    });

    expect(checkbox).toBeChecked();
  });

  it('shows loading state during API call', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<CompleteToDo todo={mockTodo} />);
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ ...mockTodo, completed: true }),
    });
  });

  it('handles API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Failed to update todo',
    });

    render(<CompleteToDo todo={mockTodo} />);
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText(/Failed to update todo/i)).toBeInTheDocument();
    });
  });

  it('is accessible', async () => {
    render(<CompleteToDo todo={mockTodo} />);
    const checkbox = screen.getByRole('checkbox', { name: mockTodo.title });

    expect(checkbox).toHaveAccessibleName(mockTodo.title);
  });
});