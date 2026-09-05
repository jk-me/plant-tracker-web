import {
  tableFeatures,
  columnFilteringFeature,
  globalFilteringFeature,
  createFilteredRowModel,
  filterFn_includesString,
  columnResizingFeature,
  columnSizingFeature,
} from '@tanstack/react-table'

export const tableFeatureSet = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnResizingFeature,
  columnSizingFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
})

export const defaultColumnSize = (headerLabel: string) => {
  switch (headerLabel) {
    case 'Name':
      return { minSize: 300, size: 500 }
    case 'Blooming Size':
      return { minSize: 50, size: 75 }
    default:
      return { minSize: 100, size: 150 }
  }
}

export type TableFeatureSet = typeof tableFeatureSet
