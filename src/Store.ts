export default abstract class Store {

  private mutatedHandlers = new Set<() => void>()

  public onMutated(handler: () => void) {
    this.mutatedHandlers.add(handler)
    return () => { this.mutatedHandlers.delete(handler) }
  }

  public mutated() {
    this.mutatedHandlers.forEach(handler => handler())
  }

  public mutation<F extends(...args: any[]) => any>(key: string, fn: F): F {
    const mutation = (...args: any[]) => {
      return this.mutate(() => fn.call(this, ...args))
    }
    
    return mutation as F
  }

  public mutate<T>(fn: () => T): T{
    try {
      return fn()
    } finally {
      this.mutated()
    }
  }

}
