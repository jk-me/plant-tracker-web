import { useState, type FormEvent } from 'react'
import type { Plant, PlantFormData } from '../types'

interface PlantFormProps {
  initial?: Partial<Plant>
  onSubmit: (data: Partial<PlantFormData>) => Promise<void>
  onCancel: () => void
}

const dateFields: Array<{ key: keyof PlantFormData; label: string }> = [
  { key: 'acquired_date', label: 'Acquired Date' },
  { key: 'last_update_date', label: 'Last Update' },
  { key: 'last_photo_date', label: 'Last Photo' },
  { key: 'slow_release_date', label: 'Slow Release' },
  { key: 'repotted_date', label: 'Re-Potted' },
]

const textFields: Array<{ key: keyof PlantFormData; label: string }> = [
  { key: 'orchid_family', label: 'Orchid Family' },
  { key: 'location', label: 'Location' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'light', label: 'Light' },
  { key: 'water', label: 'Water' },
  { key: 'temperature', label: 'Temperature' },
  { key: 'summer_in_out', label: 'Summer In/Out' },
  { key: 'dormancy', label: 'Dormancy' },
  { key: 'mislabeled_original_tag', label: 'Mislabeled (Orig Tag)' },
]

const costFields: Array<{ key: keyof PlantFormData; label: string }> = [
  { key: 'cost', label: 'Cost' },
  { key: 'shipping_cost', label: 'Shipping Cost' },
  { key: 'total_cost', label: 'Total Cost' },
]

export default function PlantForm({ initial = {}, onSubmit, onCancel }: PlantFormProps) {
  const [name, setName] = useState(initial.name ?? '')
  const [bloomingSize, setBloomingSize] = useState(initial.blooming_size ?? false)
  const [todo, setTodo] = useState(initial.todo ?? '')
  const [commonIssues, setCommonIssues] = useState(initial.common_issues ?? '')
  const [orchidAncestryLink, setOrchidAncestryLink] = useState(initial.orchid_ancestry_link ?? '')
  const [speciesAncestry, setSpeciesAncestry] = useState(initial.species_ancestry ?? '')
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const { key } of [...dateFields, ...textFields, ...costFields]) {
      const val = initial[key as keyof Plant]
      init[key] = val != null ? String(val) : ''
    }
    return init
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function setField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data: Partial<PlantFormData> = {
        name,
        blooming_size: bloomingSize,
        todo: todo || null,
        common_issues: commonIssues || null,
        orchid_ancestry_link: orchidAncestryLink || null,
        species_ancestry: speciesAncestry || null,
      }
      for (const [key, value] of Object.entries(fields)) {
        ;(data as Record<string, unknown>)[key] = value || null
      }
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="plant-form">
      <h2>{initial.id ? 'Edit Plant' : 'New Plant'}</h2>
      {error && <p className="error">{error}</p>}

      <label>
        Name *
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={bloomingSize}
          onChange={(e) => setBloomingSize(e.target.checked)}
        />
        Blooming Size
      </label>

      {textFields.map(({ key, label }) => (
        <label key={key}>
          {label}
          <input
            type="text"
            value={fields[key] ?? ''}
            onChange={(e) => setField(key, e.target.value)}
          />
        </label>
      ))}

      {dateFields.map(({ key, label }) => (
        <label key={key}>
          {label}
          <input
            type="date"
            value={fields[key] ?? ''}
            onChange={(e) => setField(key, e.target.value)}
          />
        </label>
      ))}

      {costFields.map(({ key, label }) => (
        <label key={key}>
          {label}
          <input
            type="number"
            step="0.01"
            min="0"
            value={fields[key] ?? ''}
            onChange={(e) => setField(key, e.target.value)}
          />
        </label>
      ))}

      <label>
        To-Do
        <textarea value={todo} onChange={(e) => setTodo(e.target.value)} rows={3} />
      </label>

      <label>
        Common Issues
        <textarea value={commonIssues} onChange={(e) => setCommonIssues(e.target.value)} rows={3} />
      </label>

      <label>
        Orchid Ancestry Link
        <textarea
          value={orchidAncestryLink}
          onChange={(e) => setOrchidAncestryLink(e.target.value)}
          rows={2}
        />
      </label>

      <label>
        Species Ancestry
        <textarea
          value={speciesAncestry}
          onChange={(e) => setSpeciesAncestry(e.target.value)}
          rows={2}
        />
      </label>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  )
}
