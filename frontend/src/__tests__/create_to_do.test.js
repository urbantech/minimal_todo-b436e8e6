import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateToDo from '../components/CreateToDo';

jest.mock('node-fetch', () => jest.fn());

describe('CreateToDo Component', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch.mockReset();
  });

  it('renders correctly', () => {
    render(<CreateToDo />);
    expect(screen.getByTestId('create_to_do-container')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a new task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('handles user input and button click', async () => {
    render(<CreateToDo />);
    const inputElement = screen.getByPlaceholderText('Add a new task');
    const buttonElement = screen.getByRole('button', { name: /add/i });

    userEvent.type(inputElement, 'Test Task');
    userEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ainative.studio',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ task: 'Test Task' }),
        })
      );
    });
  });

  it('shows loading state when creating a to-do item', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({ json: () => Promise.resolve({ id: 1, task: 'Test Task', completed: false }) })
    );

    render(<CreateToDo />);
    const inputElement = screen.getByPlaceholderText('Add a new task');
    const buttonElement = screen.getByRole('button', { name: /add/i });

    userEvent.type(inputElement, 'Test Task');
    userEvent.click(buttonElement);

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
    });
  });

  it('handles API errors when creating a to-do item', async () => {
    mockFetch.mockImplementation(() => Promise.reject(new Error('API Error')));

    render(<CreateToDo />);
    const inputElement = screen.getByPlaceholderText('Add a new task');
    const buttonElement = screen.getByRole('button', { name: /add/i });

    userEvent.type(inputElement, 'Test Task');
    userEvent.click(buttonElement);

    await waitFor(() => {
      expect(screen.getByText(/failed to create task/i)).toBeInTheDocument();
    });
  });

  it('is accessible', async () => {
    render(<CreateToDo />);
    const inputElement = screen.getByPlaceholderText('Add a new task');
    const buttonElement = screen.getByRole('button', { name: /add/i });

    expect(inputElement).toBeAccessible();
    expect(buttonElement).toBeAccessible();
  });
});