interface Store {
  get<T = unknown>(path: string): Promise<T | undefined>
  update(updates: Record<string, any>): Promise<void>
}

export { type Store }