import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PlantList from './PlantList'
import * as api from '../api'
import { makePlant } from '../test/helper'

vi.mock('../api')

function renderPlantList() {
  return render(
    <MemoryRouter initialEntries={['/plants']}>
      <Routes>
        <Route path="/plants" element={<PlantList />} />
        <Route path="/plants/new" element={<p>New Plant Page</p>} />
        <Route path="/plants/:id/edit" element={<p>Edit Plant Page</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PlantList', () => {
  beforeEach(() => {
    vi.mocked(api.getPlants).mockResolvedValue([
      makePlant(1, 'Orchid Alpha'),
      makePlant(2, 'Orchid Beta'),
    ])
  })

  it('shows a loading state initially', () => {
    vi.mocked(api.getPlants).mockReturnValue(new Promise(() => {}))
    renderPlantList()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders a table row per plant with editable cells', async () => {
    renderPlantList()
    expect(await screen.findByDisplayValue('Orchid Alpha')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Orchid Beta')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Family' })).toBeInTheDocument()
  })

  it('shows an error message when getPlants fails', async () => {
    vi.mocked(api.getPlants).mockRejectedValue(new Error('Network error'))
    renderPlantList()
    expect(await screen.findByText(/network error/i)).toBeInTheDocument()
  })

  it('shows empty state message when no plants match search', async () => {
    renderPlantList()
    await screen.findByDisplayValue('Orchid Alpha')

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(/search plants/i), 'Zzz')
    expect(screen.getByText(/no plants found/i)).toBeInTheDocument()
  })

  it('filters plants by search input', async () => {
    renderPlantList()
    await screen.findByDisplayValue('Orchid Alpha')

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(/search plants/i), 'Alpha')

    expect(screen.getByDisplayValue('Orchid Alpha')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Orchid Beta')).not.toBeInTheDocument()
  })

  it('navigates to the new plant page when "+ New Plant" is clicked', async () => {
    renderPlantList()
    await screen.findByDisplayValue('Orchid Alpha')

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /new plant/i }))

    expect(await screen.findByText('New Plant Page')).toBeInTheDocument()
  })

  it('navigates to the edit page when a row is clicked', async () => {
    renderPlantList()
    const nameInput = await screen.findByDisplayValue('Orchid Alpha')

    const user = userEvent.setup()
    await user.click(nameInput.closest('tr')!)

    expect(await screen.findByText('Edit Plant Page')).toBeInTheDocument()
  })

  it('saves an edited cell value', async () => {
    vi.mocked(api.updatePlant).mockResolvedValue(makePlant(1, 'Orchid Alpha Updated'))
    renderPlantList()
    const nameInput = await screen.findByDisplayValue('Orchid Alpha')

    const user = userEvent.setup()
    await user.clear(nameInput)
    await user.type(nameInput, 'Orchid Alpha Updated')
    await user.tab()

    await waitFor(() => {
      expect(api.updatePlant).toHaveBeenCalledWith(1, { name: 'Orchid Alpha Updated' })
    })
  })

  it('removes a plant after clicking delete', async () => {
    vi.mocked(api.deletePlant).mockResolvedValue(undefined)

    renderPlantList()
    await screen.findByDisplayValue('Orchid Alpha')

    const user = userEvent.setup()
    const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i })
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Orchid Alpha')).not.toBeInTheDocument()
    })
    expect(api.deletePlant).toHaveBeenCalledWith(1)
  })
})
