import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlantCard from './PlantCard';
import type { Plant } from '../types';

const basePlant: Plant = {
  id: 1,
  name: 'Phalaenopsis',
  acquired_date: null,
  blooming_size: false,
  todo: null,
  location: 'Shelf A',
  last_update_date: null,
  last_photo_date: null,
  slow_release_date: null,
  repotted_date: null,
  orchid_family: 'Orchidaceae',
  summer_in_out: null,
  vendor: 'OrchdidShop',
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
};

describe('PlantCard', () => {
  it('renders the plant name', () => {
    render(<PlantCard plant={basePlant} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Phalaenopsis')).toBeInTheDocument();
  });

  it('shows the BS badge when blooming_size is true', () => {
    render(<PlantCard plant={{ ...basePlant, blooming_size: true }} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('BS')).toBeInTheDocument();
  });

  it('does not show the BS badge when blooming_size is false', () => {
    render(<PlantCard plant={basePlant} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText('BS')).not.toBeInTheDocument();
  });

  it('renders optional fields when provided', () => {
    render(<PlantCard plant={basePlant} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Orchidaceae')).toBeInTheDocument();
    expect(screen.getByText('Shelf A')).toBeInTheDocument();
    expect(screen.getByText('OrchdidShop')).toBeInTheDocument();
  });

  it('calls onEdit with the plant when Edit is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<PlantCard plant={basePlant} onEdit={onEdit} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(basePlant);
  });

  it('shows a confirmation prompt before deleting', async () => {
    const user = userEvent.setup();
    render(<PlantCard plant={basePlant} onEdit={vi.fn()} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    // The confirm text uses HTML curly quotes and the name is a separate text node,
    // so match on the container's full text content using a function matcher.
    expect(
      screen.getByText((_, el) =>
        el?.textContent?.replace(/\s+/g, ' ').trim() === '\u201cPhalaenopsis\u201d?'
        || el?.classList.contains('confirm-text') === true
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yes, delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onDelete with plant id when deletion is confirmed', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<PlantCard plant={basePlant} onEdit={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(screen.getByRole('button', { name: /yes, delete/i }));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('cancels deletion when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<PlantCard plant={basePlant} onEdit={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByText(/yes, delete/i)).not.toBeInTheDocument();
  });
});
