import { useEffect, useState } from 'react'
import type { CellContext } from '@tanstack/react-table'
import type { Plant } from '../types'
import type { TableFeatureSet } from './tableFeatures'

export type FieldType = 'text' | 'number' | 'date' | 'boolean'

export default function EditableCell({
  getValue,
  row,
  column,
  table,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: CellContext<TableFeatureSet, Plant, any>) {
  const initialValue = getValue()
  const [value, setValue] = useState(initialValue)
  const type = (column.columnDef.meta?.type ?? 'text') as FieldType

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  function commit() {
    if (value !== initialValue) {
      table.options.meta?.updateData(row.index, column.id, value)
    }
  }

  if (type === 'boolean') {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          setValue(e.target.checked)
          table.options.meta?.updateData(row.index, column.id, e.target.checked)
        }}
      />
    )
  }

  return (
    <input
      type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
      step={type === 'number' ? '0.01' : undefined}
      min={type === 'number' ? '0' : undefined}
      value={value == null ? '' : String(value)}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      className="cell-input"
    />
  )
}
