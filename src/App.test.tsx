import {describe, it, expect, vi} from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import * as api from './api';

vi.mock('./api');

describe('App', () => {
  it('checks for an existing session on load and shows the login form if not authenticated', () => {
    vi.mocked(api.getCurrentUser).mockRejectedValue({status:401, message:'Unauthorized'});
    render(<App />);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows the plant list when a valid session exists', async () => {
    const mockUser = { id: 1, email_address: 'a@b.com', created_at: '', updated_at: '' };
    vi.mocked(api.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(api.getPlants).mockResolvedValue([]);
    render(<App />);
    expect(await screen.findByText(/a@b.com/i)).toBeInTheDocument();
  });
})
