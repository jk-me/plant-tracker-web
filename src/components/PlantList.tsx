import { useState, useEffect, useCallback } from 'react';
import * as api from '../api';
import type { Plant } from '../types';
import PlantCard from './PlantCard';
import PlantForm from './PlantForm';

export default function PlantList() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [search, setSearch] = useState('');

  const loadPlants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPlants();
      setPlants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlants();
  }, [loadPlants]);

  async function handleCreate(data: Parameters<typeof api.createPlant>[0]) {
    const newPlant = await api.createPlant(data);
    setPlants((prev) => [newPlant, ...prev]);
    setShowNewForm(false);
  }

  async function handleUpdate(data: Parameters<typeof api.updatePlant>[1]) {
    if (!editingPlant) return;
    const updated = await api.updatePlant(editingPlant.id, data);
    setPlants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPlant(null);
  }

  async function handleDelete(id: number) {
    await api.deletePlant(id);
    setPlants((prev) => prev.filter((p) => p.id !== id));
  }

  const filtered = plants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (showNewForm) {
    return (
      <PlantForm
        onSubmit={handleCreate}
        onCancel={() => setShowNewForm(false)}
      />
    );
  }

  if (editingPlant) {
    return (
      <PlantForm
        initial={editingPlant}
        onSubmit={handleUpdate}
        onCancel={() => setEditingPlant(null)}
      />
    );
  }

  return (
    <div className="plant-list">
      <div className="plant-list-toolbar">
        <input
          type="search"
          placeholder="Search plants…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button onClick={() => setShowNewForm(true)}>+ New Plant</button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p>No plants found. Add your first plant!</p>
      )}

      <div className="plant-grid">
        {filtered.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            onEdit={setEditingPlant}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
