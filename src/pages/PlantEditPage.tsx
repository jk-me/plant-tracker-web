import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as api from '../api'
import type { Plant } from '../types'
import PlantForm from '../components/PlantForm'

export default function PlantEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [plant, setPlant] = useState<Plant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await api.getPlant(Number(id))
        if (!cancelled) setPlant(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load plant')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleUpdate(data: Parameters<typeof api.updatePlant>[1]) {
    if (!plant) return
    await api.updatePlant(plant.id, data)
    navigate('/plants')
  }

  if (loading) return <p>Loading…</p>
  if (error) return <p className="error">{error}</p>
  if (!plant) return null

  return <PlantForm initial={plant} onSubmit={handleUpdate} onCancel={() => navigate('/plants')} />
}
