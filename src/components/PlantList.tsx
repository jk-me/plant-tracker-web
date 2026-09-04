import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTable, createColumnHelper, flexRender } from '@tanstack/react-table'
import * as api from '../api'
import type { Plant, PlantFormData } from '../types'
import EditableCell, { type FieldType } from './EditableCell'
import { tableFeatureSet } from './tableFeatures'

const columnHelper = createColumnHelper<typeof tableFeatureSet, Plant>()

const fieldDefs: Array<{ key: keyof PlantFormData; label: string; type: FieldType }> = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'blooming_size', label: 'Blooming Size', type: 'boolean' },
  { key: 'orchid_family', label: 'Family', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'vendor', label: 'Vendor', type: 'text' },
  { key: 'acquired_date', label: 'Acquired', type: 'date' },
  { key: 'last_update_date', label: 'Last Update', type: 'date' },
  { key: 'last_photo_date', label: 'Last Photo', type: 'date' },
  { key: 'slow_release_date', label: 'Slow Release', type: 'date' },
  { key: 'repotted_date', label: 'Re-Potted', type: 'date' },
  { key: 'summer_in_out', label: 'Summer In/Out', type: 'text' },
  { key: 'light', label: 'Light', type: 'text' },
  { key: 'water', label: 'Water', type: 'text' },
  { key: 'temperature', label: 'Temperature', type: 'text' },
  { key: 'dormancy', label: 'Dormancy', type: 'text' },
  { key: 'cost', label: 'Cost', type: 'number' },
  { key: 'shipping_cost', label: 'Shipping Cost', type: 'number' },
  { key: 'total_cost', label: 'Total Cost', type: 'number' },
  { key: 'mislabeled_original_tag', label: 'Mislabeled Tag', type: 'text' },
  { key: 'todo', label: 'To-Do', type: 'text' },
  { key: 'common_issues', label: 'Common Issues', type: 'text' },
  { key: 'orchid_ancestry_link', label: 'Ancestry Link', type: 'text' },
  { key: 'species_ancestry', label: 'Species Ancestry', type: 'text' },
]

export default function PlantList() {
  const navigate = useNavigate()
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadPlants = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getPlants()
      setPlants(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plants')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPlants()
  }, [loadPlants])

  async function updateData(rowIndex: number, columnId: string, value: unknown) {
    const plant = plants[rowIndex]
    if (!plant) return
    const previous = plants
    setPlants((old) =>
      old.map((row, index) => (index === rowIndex ? { ...row, [columnId]: value } : row))
    )
    try {
      await api.updatePlant(plant.id, { [columnId]: value } as Partial<PlantFormData>)
    } catch (err) {
      setPlants(previous)
      setError(err instanceof Error ? err.message : 'Failed to update plant')
    }
  }

  async function handleDelete(id: number) {
    await api.deletePlant(id)
    setPlants((prev) => prev.filter((p) => p.id !== id))
  }

  const columns = useMemo(
    () => [
      ...fieldDefs.map(({ key, label, type }) =>
        columnHelper.accessor(key, {
          header: label,
          cell: EditableCell,
          meta: { type },
        })
      ),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            className="danger"
            onClick={(e) => {
              e.stopPropagation()
              void handleDelete(row.original.id)
            }}
          >
            Delete
          </button>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plants]
  )

  const table = useTable({
    features: tableFeatureSet,
    data: plants,
    columns,
    state: { globalFilter: search },
    onGlobalFilterChange: setSearch,
    globalFilterFn: (row, _columnId, filterValue) =>
      row.original.name.toLowerCase().includes(String(filterValue).toLowerCase()),
    meta: { updateData },
  })

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
        <button onClick={() => navigate('/plants/new')}>+ New Plant</button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && table.getFilteredRowModel().rows.length === 0 && (
        <p>No plants found. Add your first plant!</p>
      )}

      {!loading && !error && table.getFilteredRowModel().rows.length > 0 && (
        <div className="plant-table-wrapper">
          <table className="plant-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getFilteredRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="plant-table-row"
                  onClick={() => navigate(`/plants/${row.original.id}/edit`)}
                >
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
