import { useState } from 'react'
import type { Plant } from '../types'

interface PlantCardProps {
  plant: Plant
  onEdit: (plant: Plant) => void
  onDelete: (id: number) => void
}

function daysSince(dateStr: string | null): string {
  if (!dateStr) return '—'
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  return `${diff}d`
}

export default function PlantCard({ plant, onEdit, onDelete }: PlantCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <div className="plant-card">
      <div className="plant-card-header">
        <h3>{plant.name}</h3>
        {plant.blooming_size && <span className="badge">BS</span>}
      </div>

      <dl className="plant-details">
        {plant.orchid_family && (
          <>
            <dt>Family</dt>
            <dd>{plant.orchid_family}</dd>
          </>
        )}
        {plant.location && (
          <>
            <dt>Location</dt>
            <dd>{plant.location}</dd>
          </>
        )}
        {plant.vendor && (
          <>
            <dt>Vendor</dt>
            <dd>{plant.vendor}</dd>
          </>
        )}
        <dt>Last update</dt>
        <dd>{daysSince(plant.last_update_date)} ago</dd>
        <dt>Last photo</dt>
        <dd>{daysSince(plant.last_photo_date)} ago</dd>
        {plant.todo && (
          <>
            <dt>To-Do</dt>
            <dd>{plant.todo}</dd>
          </>
        )}
      </dl>

      <div className="plant-card-actions">
        <button onClick={() => onEdit(plant)}>Edit</button>
        {confirmingDelete ? (
          <>
            <span className="confirm-text">Delete &ldquo;{plant.name}&rdquo;?</span>
            <button onClick={() => onDelete(plant.id)} className="danger">
              Yes, delete
            </button>
            <button onClick={() => setConfirmingDelete(false)}>Cancel</button>
          </>
        ) : (
          <button onClick={() => setConfirmingDelete(true)} className="danger">
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
