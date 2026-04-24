import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlantList from './PlantList';
import * as api from '../api';
import type { Plant } from '../types';

vi.mock('../api');

const makePlant = (id: number, name: string): Plant => ({
  id,
  name,
  acquired_date: null,
  blooming_size: false,
  todo: null,
  location: null,
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
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
});

describe('PlantList', () => {
  beforeEach(() => {
    vi.mocked(api.getPlants).mockResolvedValue([
      makePlant(1, 'Orchid Alpha'),
      makePlant(2, 'Orchid Beta'),
    ]);
  });

  it('shows a loading state initially', () => {
    vi.mocked(api.getPlants).mockReturnValue(new Promise(() => {}));
    render(<PlantList />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders plant cards after loading', async () => {
    render(<PlantList />);
    expect(await screen.findByText('Orchid Alpha')).toBeInTheDocument();
    expect(screen.getByText('Orchid Beta')).toBeInTheDocument();
  });

  it('shows an error message when getPlants fails', async () => {
    vi.mocked(api.getPlants).mockRejectedValue(new Error('Network error'));
    render(<PlantList />);
    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });

  it('shows empty state message when no plants match search', async () => {
    render(<PlantList />);
    await screen.findByText('Orchid Alpha');

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/search plants/i), 'Zzz');
    expect(screen.getByText(/no plants found/i)).toBeInTheDocument();
  });

  it('filters plants by search input', async () => {
    render(<PlantList />);
    await screen.findByText('Orchid Alpha');

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/search plants/i), 'Alpha');

    expect(screen.getByText('Orchid Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Orchid Beta')).not.toBeInTheDocument();
  });

  it('shows the new plant form when "+ New Plant" is clicked', async () => {
    render(<PlantList />);
    await screen.findByText('Orchid Alpha');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /new plant/i }));

    expect(screen.getByRole('heading', { name: /new plant/i })).toBeInTheDocument();
  });

  it('adds a new plant and returns to the list', async () => {
    const newPlant = makePlant(3, 'Orchid Gamma');
    vi.mocked(api.createPlant).mockResolvedValue(newPlant);

    render(<PlantList />);
    await screen.findByText('Orchid Alpha');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /new plant/i }));
    await user.type(screen.getByLabelText(/name/i), 'Orchid Gamma');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Orchid Gamma')).toBeInTheDocument();
  });

  it('removes a plant after deletion is confirmed', async () => {
    vi.mocked(api.deletePlant).mockResolvedValue(undefined);

    render(<PlantList />);
    await screen.findByText('Orchid Alpha');

    const user = userEvent.setup();
    // There are two Delete buttons; click the first one
    const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
    await user.click(deleteButtons[0]);
    await user.click(screen.getByRole('button', { name: /yes, delete/i }));

    await waitFor(() => {
      expect(screen.queryByText('Orchid Alpha')).not.toBeInTheDocument();
    });
    expect(api.deletePlant).toHaveBeenCalledWith(1);
  });
});
