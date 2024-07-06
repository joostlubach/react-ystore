import { mapValues, pick } from 'lodash'
import React from 'react'
import { useContinuousRef } from 'react-util/hooks'
import { AnyFunction, isFunction, objectEquals } from 'ytil'

import Store from './Store'
import { State, StateExtract } from './types'

export function createUseStore<S extends Store>() {
  const useStore = <E extends StateExtract<S>>(model: S, extract: E, options: UseStoreOptions<S, E> = {}): State<S, E> => {
    const {
      stateChanged = defaultStateChanged,
    } = options
  
  
    const cache = React.useMemo((): Record<string, AnyFunction> => ({}), [])
    const [state, setState] = React.useState(() => deriveState(model, extract, cache))
    const stateRef = useContinuousRef(state)  
  
    React.useEffect(() => {
      return model.onMutated(() => {
        const next = deriveState(model, extract, cache)
        if (stateChanged(stateRef.current, next)) {
          setState(next)
        }
      })
    }, [])
  
    return state
  }

  return useStore
}

export interface UseStoreOptions<S extends Store, E extends StateExtract<S>> {
  stateChanged?: (prev: State<S, E>, next: State<S, E>) => boolean
  getters?:      Array<RegExp | string>
}

function deriveState<S extends Store, E extends StateExtract<S>>(store: S, extract: E, cache: Record<string, AnyFunction>): State<S, E> {
  const state = (isFunction(extract) ? extract(store) : pick(store, extract)) as State<S, E>

  return mapValues(state, (value, key) => {
    if (!isFunction(value)) { return value }
    return cache[key] ??= store.mutation(key, value)
  }) as State<S, E>
}

function defaultStateChanged<S extends Record<string, any>>(prev: S, next: S) {
  return !objectEquals(prev, next)
}