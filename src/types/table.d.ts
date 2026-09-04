import '@tanstack/react-table'
import type { FieldType } from '../components/EditableCell'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TFeatures, TData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TFeatures, TData, TValue> {
    type?: FieldType
  }
}
