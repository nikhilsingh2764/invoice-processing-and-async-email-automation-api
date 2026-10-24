import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useIdleTimeout } from '../src/hooks/useIdleTimeout.js'
import { useDebounce } from '../src/hooks/useDebounce.js'
import { useHotkeys } from '../src/hooks/useHotkeys.js'

afterEach(() => vi.useRealTimers())

describe('useIdleTimeout', () => {
  it('warns after the idle period and signs out after the warning', () => {
    vi.useFakeTimers()
    const onTimeout = vi.fn()
    const { result } = renderHook(() => useIdleTimeout({ enabled: true, onTimeout, idleMinutes: 1, warnSeconds: 10 }))
    expect(result.current.warning).toBe(false)
    act(() => vi.advanceTimersByTime(61_000))
    expect(result.current.warning).toBe(true)
    act(() => vi.advanceTimersByTime(11_000))
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })
  it('"stay" resets the clock', () => {
    vi.useFakeTimers()
    const onTimeout = vi.fn()
    const { result } = renderHook(() => useIdleTimeout({ enabled: true, onTimeout, idleMinutes: 1, warnSeconds: 10 }))
    act(() => vi.advanceTimersByTime(62_000))
    act(() => result.current.stay())
    act(() => vi.advanceTimersByTime(30_000))
    expect(onTimeout).not.toHaveBeenCalled()
    expect(result.current.warning).toBe(false)
  })
  it('does nothing while disabled', () => {
    vi.useFakeTimers()
    const onTimeout = vi.fn()
    renderHook(() => useIdleTimeout({ enabled: false, onTimeout, idleMinutes: 1, warnSeconds: 1 }))
    act(() => vi.advanceTimersByTime(10 * 60_000))
    expect(onTimeout).not.toHaveBeenCalled()
  })
})

describe('useDebounce', () => {
  it('only updates after the delay', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: 'a' } })
    rerender({ v: 'ab' })
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('ab')
  })
})

describe('useHotkeys (WCAG 2.1.4)', () => {
  it('ignores single-key shortcuts while typing in a field', () => {
    const run = vi.fn()
    renderHook(() => useHotkeys({ n: run }))
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }))
    expect(run).not.toHaveBeenCalled()
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }))
    expect(run).toHaveBeenCalledTimes(1)
    input.remove()
  })
  it('supports two-key sequences', () => {
    const go = vi.fn()
    renderHook(() => useHotkeys({ 'g d': go }))
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', bubbles: true }))
    expect(go).toHaveBeenCalledTimes(1)
  })
})
