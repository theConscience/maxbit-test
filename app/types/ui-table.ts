export type UiTableAlign = 'left' | 'center' | 'right'
export type UiTableColumn = {
  key: string
  header: string
  cellClass?: string
  thClass?: string
  widthClass?: string
  align?: UiTableAlign
}
