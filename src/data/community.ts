export type CommunityCategory =
  | 'All'
  | 'Natural'
  | 'Sea'
  | 'Waterfall'
  | 'Mountain'
  | 'Cultural'
  | 'Food'
  | 'Forest'

export type StoryCategory = Exclude<CommunityCategory, 'All'>

export type CommunitySortOption =
  | 'latest'
  | 'popular'
  | 'discussed'
  | 'top-rated'

export interface CommunityAuthor {
  id?: string
  name: string
  handle: string
  initials: string
  avatarColor: string
  avatar?: string
  homeBase: string
}

export interface CommunityStory {
  id: string
  title: string
  excerpt: string
  body?: string
  image?: string
  images: string[]
  video?: string
  category: StoryCategory
  location: string
  likes: number
  comments: number
  rating: number
  publishedAt: string
  status?: string
  author: CommunityAuthor
  liked: boolean
}

export interface ComposerSubmission {
  title: string
  body: string
  category: StoryCategory
  location: string
  rating: number
  photoName?: string
  photoUrl?: string
  videoName?: string
  videoUrl?: string
}

export interface TrendingPlace {
  id: number
  name: string
  province: string
  category: StoryCategory
  mentions: number
  summary: string
  visits: number
}

export interface TopTraveler {
  id: number
  name: string
  handle: string
  initials: string
  avatarColor: string
  specialty: string
  trips: number
  followed: boolean
  avatar: string
  stories: number
}

export interface PopularProvince {
  id: number
  name: string
  storyCount: number
  image: string
  descriptor: string
  slug: string
  stories: number
}

export interface HeroStat {
  label: string
  value: string
  hint: string
}

export const communityCategories: CommunityCategory[] = [
  'All',
  'Natural',
  'Sea',
  'Waterfall',
  'Mountain',
  'Cultural',
  'Food',
  'Forest',
]

export const communitySortOptions: Array<{
  label: string
  value: CommunitySortOption
}> = [
  { label: 'Latest', value: 'latest' },
  { label: 'Most liked', value: 'popular' },
  { label: 'Most discussed', value: 'discussed' },
  { label: 'Top rated', value: 'top-rated' },
]

export const categoryCoverMap: Record<StoryCategory, string> = {
  Natural:
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80',
  Sea: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  Waterfall:
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
  Mountain:
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
  Cultural:
    'https://images.unsplash.com/photo-1538964173425-93884e739ccd?auto=format&fit=crop&w=1200&q=80',
  Food: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  Forest:
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
}

const authors: CommunityAuthor[] = [
  {
    name: 'Dara Sok',
    handle: '@darasok',
    initials: 'DS',
    avatarColor: '#1a2340',
    homeBase: 'Phnom Penh',
  },
  {
    name: 'Malis Chhun',
    handle: '@malischhun',
    initials: 'MC',
    avatarColor: '#2d6a4f',
    homeBase: 'Siem Reap',
  },
  {
    name: 'Rina Vann',
    handle: '@rinavann',
    initials: 'RV',
    avatarColor: '#8a5a24',
    homeBase: 'Kampot',
  },
  {
    name: 'Kosal Heng',
    handle: '@kosalheng',
    initials: 'KH',
    avatarColor: '#3d5a80',
    homeBase: 'Koh Kong',
  },
  {
    name: 'Sothea Lim',
    handle: '@sothealim',
    initials: 'SL',
    avatarColor: '#7a6030',
    homeBase: 'Mondulkiri',
  },
]

export const communityStories: CommunityStory[] = [
  {
    id: 'local-1',
    title: 'Kayaking through Koh Kong mangroves before the tide changed',
    excerpt:
      'We left at sunrise with a local guide, found glassy water, and stopped at a floating platform for coffee while hornbills crossed overhead.',
    images: [categoryCoverMap.Natural],
    category: 'Natural',
    location: 'Koh Kong',
    likes: 486,
    comments: 33,
    rating: 4.9,
    publishedAt: '2026-04-18T07:30:00.000Z',
    author: authors[3],
    liked: false,
  },
  {
    id: 'local-2',
    title: 'A full day on Koh Rong with no plan except finding the quietest beach',
    excerpt:
      'Long walks, clear water, and a sunset that made the entire west coast glow. The smaller coves were worth the extra hike.',
    images: [categoryCoverMap.Sea],
    category: 'Sea',
    location: 'Sihanoukville',
    likes: 412,
    comments: 28,
    rating: 4.8,
    publishedAt: '2026-04-16T12:15:00.000Z',
    author: authors[1],
    liked: true,
  },
  {
    id: 'local-3',
    title: 'Bou Sra waterfall was louder and wider than I expected',
    excerpt:
      'The second drop had fewer people in the afternoon, and the mist kept the whole trail cool even in the dry season.',
    images: [categoryCoverMap.Waterfall],
    category: 'Waterfall',
    location: 'Mondulkiri',
    likes: 355,
    comments: 19,
    rating: 4.7,
    publishedAt: '2026-04-13T09:20:00.000Z',
    author: authors[4],
    liked: false,
  },
  {
    id: 'local-4',
    title: 'Bokor viewpoints, abandoned buildings, and the best road trip fog',
    excerpt:
      'The mountain road felt cinematic all morning. Start early, stop often, and bring a jacket because the wind is real near the top.',
    images: [categoryCoverMap.Mountain],
    category: 'Mountain',
    location: 'Kampot',
    likes: 297,
    comments: 24,
    rating: 4.6,
    publishedAt: '2026-04-10T05:50:00.000Z',
    author: authors[2],
    liked: false,
  },
  {
    id: 'local-5',
    title: 'Siem Reap after dark: temple stories, Apsara dance, and old market lanes',
    excerpt:
      'This was not a checklist day. We slowed down, talked to guides, and ended up learning more from the people than from the itinerary.',
    images: [categoryCoverMap.Cultural],
    category: 'Cultural',
    location: 'Siem Reap',
    likes: 441,
    comments: 41,
    rating: 5,
    publishedAt: '2026-04-07T13:05:00.000Z',
    author: authors[0],
    liked: true,
  },
  {
    id: 'local-6',
    title: 'Kep crab market lunch guide for anyone who wants the fresh stuff',
    excerpt:
      'Go before the biggest lunch rush, order Kampot pepper crab first, and save room for grilled squid from the stalls near the pier.',
    images: [categoryCoverMap.Food],
    category: 'Food',
    location: 'Kep',
    likes: 268,
    comments: 17,
    rating: 4.5,
    publishedAt: '2026-04-05T11:00:00.000Z',
    author: authors[2],
    liked: false,
  },
  {
    id: 'local-7',
    title: 'Cardamom forest trail notes from a two-day eco camp',
    excerpt:
      'Leeches, rain, and one unforgettable night chorus. It was rough in the best way and still felt accessible with a guide.',
    images: [categoryCoverMap.Forest],
    category: 'Forest',
    location: 'Pursat',
    likes: 321,
    comments: 26,
    rating: 4.8,
    publishedAt: '2026-04-02T15:40:00.000Z',
    author: authors[3],
    liked: false,
  },
]

export const trendingPlaces: TrendingPlace[] = [
  {
    id: 1,
    name: 'Kampong Phluk',
    province: 'Siem Reap',
    category: 'Natural',
    mentions: 148,
    summary: 'Floating village sunsets and calm boat routes are driving a wave of new posts.',
  },
  {
    id: 2,
    name: 'Koh Rong Samloem',
    province: 'Sihanoukville',
    category: 'Sea',
    mentions: 121,
    summary: 'Travelers are sharing quieter beach stays and off-peak ferry timing tips.',
  },
  {
    id: 3,
    name: 'Bou Sra Waterfall',
    province: 'Mondulkiri',
    category: 'Waterfall',
    mentions: 96,
    summary: 'Recent stories highlight improved access roads and short picnic stops nearby.',
  },
  {
    id: 4,
    name: 'Bokor National Park',
    province: 'Kampot',
    category: 'Mountain',
    mentions: 87,
    summary: 'Foggy drives, waterfalls, and hilltop cafes are trending this week.',
  },
  {
    id: 5,
    name: 'Kep Crab Market',
    province: 'Kep',
    category: 'Food',
    mentions: 78,
    summary: 'Food posts are focusing on seafood stalls with smaller queues and better views.',
  },
]

export const topTravelers: TopTraveler[] = [
  {
    id: 1,
    name: 'Malis Chhun',
    handle: '@malischhun',
    initials: 'MC',
    avatarColor: '#2d6a4f',
    specialty: 'Coastal routes',
    trips: 24,
    followed: true,
  },
  {
    id: 2,
    name: 'Dara Sok',
    handle: '@darasok',
    initials: 'DS',
    avatarColor: '#1a2340',
    specialty: 'Culture and city walks',
    trips: 18,
    followed: false,
  },
  {
    id: 3,
    name: 'Kosal Heng',
    handle: '@kosalheng',
    initials: 'KH',
    avatarColor: '#3d5a80',
    specialty: 'Eco trips',
    trips: 21,
    followed: false,
  },
  {
    id: 4,
    name: 'Rina Vann',
    handle: '@rinavann',
    initials: 'RV',
    avatarColor: '#8a5a24',
    specialty: 'Food weekends',
    trips: 15,
    followed: true,
  },
]

export const popularProvinces: PopularProvince[] = [
  {
    id: 1,
    name: 'Siem Reap',
    storyCount: 324,
    image:
      'https://images.unsplash.com/photo-1538964173425-93884e739ccd?auto=format&fit=crop&w=800&q=80',
    descriptor: 'Culture, temples, and floating village stories',
  },
  {
    id: 2,
    name: 'Kampot',
    storyCount: 241,
    image:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    descriptor: 'Mountain drives, pepper farms, and riverside cafes',
  },
  {
    id: 3,
    name: 'Koh Kong',
    storyCount: 206,
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=800&q=80',
    descriptor: 'Mangroves, islands, and forest lodges',
  },
]
