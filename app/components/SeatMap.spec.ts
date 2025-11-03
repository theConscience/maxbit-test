// app/components/SeatMap.spec.ts
import { mount } from '@vue/test-utils'
import SeatMap from '@/components/domain/SeatMap.vue'
import { describe, it, expect } from 'vitest'

describe('SeatMap', () => {
  it('toggles selection', async () => {
    const wrapper = mount(SeatMap, { props: { rows: 2, cols: 2, booked: [] } })
    const seats = wrapper.findAll('[aria-label="seat"]')
    expect(seats.length).toBeGreaterThan(0)

    await seats[0]!.trigger('click')

    const evts1 = wrapper.emitted('update:modelValue') as unknown[][] | undefined
    expect(((evts1?.[0]?.[0] as unknown[] | undefined) ?? []).length).toBe(1)

    await seats[0]!.trigger('click')

    const evts2 = wrapper.emitted('update:modelValue') as unknown[][] | undefined
    expect(((evts2?.[1]?.[0] as unknown[] | undefined) ?? []).length).toBe(0)
  })
})
