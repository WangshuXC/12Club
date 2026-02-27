export type Announcement = {
  id: number
  title: string
  content: string
  created: Date
  updated: Date
  user: {
    id: number
    name: string
    avatar: string
  }
}
