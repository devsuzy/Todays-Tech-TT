export type FeedStatus = 'DRAFT' | 'PUBLISHED'

export type Tag = {
  id: number
  name: string
  slug: string
  color: string | null
}

export type Source = {
  id: number
  name: string
  homeUrl: string
  feedUrl: string
  slug: string
  isActive: boolean
}

export type FeedSectionData = {
  id: number
  feedId: number
  order: number
  title: string
  body: string
}

export type FeedListItem = {
  id: number
  date: string
  status: FeedStatus
  sections: Pick<FeedSectionData, 'id' | 'order' | 'title'>[]
  tags: { tag: Tag }[]
  article: { 
    ogImage: string | null;
    source: { name: string } 
  } | null
}

export type FeedDetail = {
  id: number
  date: string
  status: FeedStatus
  sections: FeedSectionData[]
  tags: { tag: Tag }[]
  article?: {
    title: string
    originalUrl: string
    ogImage: string | null
    source: Source
  } | null
}
