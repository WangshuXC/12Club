interface Window {
  umami?: {
    track: (event: string, data: Record<string, any>) => void
    identify: (unique_id?: string, data: Record<string, any>) => void
  }
}
