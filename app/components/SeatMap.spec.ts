import { mount } from '@vue/test-utils'
import SeatMap from '@/components/domain/SeatMap.vue'
import { describe, it, expect } from 'vitest'

describe('SeatMap', () => {
  it('selects and deselects free seats', async () => {
    const wrapper = mount(SeatMap, { props: { rows: 2, cols: 2, booked: [] } })
    const seats = wrapper.findAll('[aria-label="seat"]')
    await seats[0].trigger('click')
    expect((wrapper.emitted()['update:modelValue']?.[0][0] || []).length).toBe(1)
    await seats[0].trigger('click')
    expect((wrapper.emitted()['update:modelValue']?.[1][0] || []).length).toBe(0)
  })
})
