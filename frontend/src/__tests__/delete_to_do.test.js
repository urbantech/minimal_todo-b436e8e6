import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('https://api.ainative.studio', () => ({
  fetch: jest.fn(),
}));

const DeleteToDo = ({ todoId, onDelete }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.ainative.studio/api/v1/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': 'mock-api-key',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete to-do item');
      }
      onDelete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="delete_to_do-container">
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

describe('DeleteToDo Component', () => {
  const mockTodoId = '12345';
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    global.fetch.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    render(<DeleteToDo todoId={mockTodoId} onDelete={mockOnDelete} />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    global.fetch.mockResolvedValue({ ok: true });
    render(<DeleteToDo todoId={mockTodoId} onDelete={mockOnDelete} />);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://api.ainative.studio/api/v1/todos/${mockTodoId}`,
      {
        method: 'DELETE',
        headers: {
          'X-API-Key': 'mock-api-key',
        },
      }
    );
    expect(mockOnDelete).toHaveBeenCalled();
  });

  test('shows loading state when deleting', async () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));
    render(<DeleteToDo todoId={mockTodoId} onDelete={mockOnDelete} />);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  test('handles API errors', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    render(<DeleteToDo todoId={mockTodoId} onDelete={mockOnDelete} />);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    await waitFor(() => {
      expect(screen.getByText(/error: network error/i)).toBeInTheDocument();
    });
  });

  test('is accessible', () => {
    render(<DeleteToDo todoId={mockTodoId} onDelete={mockOnDelete} />);
    const container = screen.getByTestId('delete_to_do-container');
    expect(container).toHaveAccessibleName(/delete to-do item/i);
  });
});