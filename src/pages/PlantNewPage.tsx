import { useNavigate } from 'react-router-dom'
import * as api from '../api'
import PlantForm from '../components/PlantForm'

export default function PlantNewPage() {
  const navigate = useNavigate()

  async function handleCreate(data: Parameters<typeof api.createPlant>[0]) {
    await api.createPlant(data)
    navigate('/plants')
  }

  return <PlantForm onSubmit={handleCreate} onCancel={() => navigate('/plants')} />
}
