import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../api'

const PlantHistoryPage = () => {
  const { id } = useParams<{ id: string }>()
  const [plantData, setPlantData] = useState(null)

  useEffect(() => {
    async function loadPlantData() {
      if (!id) return
      try {
        const data = await api.getPlantHistory(Number(id))
        setPlantData(data)
      } catch (err) {
        console.error('Failed to load plant history', err)
      }
    }

    void loadPlantData()
  }, [id])

  if (!plantData) return <p>Loading plant history…</p>
  return (
    <div>
      <h2>Plant History</h2>
      <pre>{JSON.stringify(plantData, null, 2)}</pre>
    </div>
  )
}
export default PlantHistoryPage
