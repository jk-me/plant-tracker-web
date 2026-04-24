import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';
import * as api from '../api';

vi.mock('../api');

describe('LoginForm', () => {
  it('renders email and password inputs and a submit button', () => {
    render(<LoginForm onSuccess={vi.fn()} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls api.login with entered credentials on submit', async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, email_address: 'a@b.com', created_at: '', updated_at: '' };
    vi.mocked(api.login).mockResolvedValue(mockUser);

    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(api.login).toHaveBeenCalledWith('a@b.com', 'secret');
    expect(onSuccess).toHaveBeenCalledWith(mockUser);
  });

  it('clears form fields after successful login', async () => {
    const user = userEvent.setup();
    vi.mocked(api.login).mockResolvedValue({ id: 1, email_address: 'a@b.com', created_at: '', updated_at: '' });

    render(<LoginForm onSuccess={vi.fn()} />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'a@b.com');
    await user.type(passwordInput, 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(emailInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
  });

  it('shows an error message when login fails', async () => {
    const user = userEvent.setup();
    vi.mocked(api.login).mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginForm onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), 'bad@bad.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('disables the button while loading', async () => {
    const user = userEvent.setup();
    // Never resolves so the button stays disabled
    vi.mocked(api.login).mockReturnValue(new Promise(() => {}));

    render(<LoginForm onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});
