import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlantForm from './PlantForm';
import type { Plant } from '../types';

const basePlant: Plant = {
  id: 7,
  name: 'Dendrobium',
  acquired_date: '2023-06-01',
  blooming_size: true,
  todo: 'Repot soon',
  location: 'Windowsill',
  last_update_date: null,
  last_photo_date: null,
  slow_release_date: null,
  repotted_date: null,
  orchid_family: null,
  summer_in_out: null,
  vendor: null,
  cost: null,
  shipping_cost: null,
  total_cost: null,
  mislabeled_original_tag: null,
  light: null,
  water: null,
  temperature: null,
  common_issues: null,
  dormancy: null,
  orchid_ancestry_link: null,
  species_ancestry: null,
  user_id: 1,
  created_at: '2023-06-01',
  updated_at: '2023-06-01',
};

describe('PlantForm', () => {
  it('renders "New Plant" heading when no initial plant is provided', () => {
    render(<PlantForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /new plant/i })).toBeInTheDocument();
  });

  it('renders "Edit Plant" heading when an existing plant is provided', () => {
    render(<PlantForm initial={basePlant} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /edit plant/i })).toBeInTheDocument();
  });

  it('pre-fills fields from the initial plant', () => {
    render(<PlantForm initial={basePlant} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByDisplayValue('Dendrobium')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Windowsill')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Repot soon')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<PlantForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/name/i), 'New Orchid');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
    const callArg = onSubmit.mock.calls[0][0] as Record<string, unknown>;
    expect(callArg.name).toBe('New Orchid');
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<PlantForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows an error if onSubmit rejects', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Save failed'));
    render(<PlantForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/name/i), 'Oops');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/save failed/i)).toBeInTheDocument();
  });
});
