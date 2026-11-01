import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListToDoItems from '../components/ListToDoItems';

const mockFetch = jest.fn();

beforeEach(() => {
  global.fetch = mockFetch;
});

afterEach(() => {
  global.fetch.mockReset();
  delete global.fetch;
});

test('renders correctly with todo items', async () => {
  mockFetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue([
      { id: 1, title: 'Task 1', completed: false },
      { id: 2, title: 'Task 2', completed: true }
    ])
  });

  render(<ListToDoItems />);
  expect(screen.getByTestId('list_to_do_items-container')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });
});

test('shows loading state while fetching', () => {
  mockFetch.mockImplementation(() => new Promise(() => {}));

  render(<ListToDoItems />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test('handles API errors gracefully', async () => {
  mockFetch.mockRejectedValue(new Error('API Error'));

  render(<ListToDoItems />);
  expect(screen.getByTestId('list_to_do_items-container')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});

test('marks a todo item as completed', async () => {
  mockFetch
    .mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        { id: 1, title: 'Task 1', completed: false }
      ])
    })
    .mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ id: 1, title: 'Task 1', completed: true })
    });

  render(<ListToDoItems />);
  await waitFor(() => {
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  const checkbox = screen.getByRole('checkbox', { name: /task 1/i });
  userEvent.click(checkbox);

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('checkbox', { name: /task 1/i })).toBeChecked();
  });
});

test('deletes a todo item', async () => {
  mockFetch
    .mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        { id: 1, title: 'Task 1', completed: false }
      ])
    })
    .mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([])
    });

  render(<ListToDoItems />);
  await waitFor(() => {
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  const deleteButton = screen.getByRole('button', { name: /delete task 1/i });
  userEvent.click(deleteButton);

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
  });
});

test('is accessible', async () => {
  mockFetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue([
      { id: 1, title: 'Task 1', completed: false }
    ])
  });

  render(<ListToDoItems />);
  await waitFor(() => {
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  expect(screen.getByRole('checkbox', { name: /task 1/i })).toHaveAttribute('aria-label', 'Complete Task 1');
  expect(screen.getByRole('button', { name: /delete task 1/i })).toHaveAttribute('aria-label', 'Delete Task 1');
});