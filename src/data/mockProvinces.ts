// Mock provinces and attractions data for development/testing
export const mockProvinces = [
  {
    id: 1,
    nameEn: 'Koh Kong',
    nameKh: 'កោះកង់',
    description: 'A coastal province known for its pristine beaches and islands.',
    mainImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'
  },
  {
    id: 2,
    nameEn: 'Phnom Penh',
    nameKh: 'ភ្នំពេញ',
    description: 'The capital city of Cambodia with rich history and culture.',
    mainImageUrl: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=600'
  },
  {
    id: 3,
    nameEn: 'Siem Reap',
    nameKh: 'សៀមរាប',
    description: 'Home to the magnificent Angkor Wat temple complex.',
    mainImageUrl: 'https://images.unsplash.com/photo-1555073876-155c00c5e4a0?w=600'
  },
  {
    id: 4,
    nameEn: 'Sihanoukville',
    nameKh: 'ក្រុងព្រះសីហនុ',
    description: 'Popular beach destination with modern tourism infrastructure.',
    mainImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'
  },
  {
    id: 5,
    nameEn: 'Kampot',
    nameKh: 'កម្ពត',
    description: 'Known for pepper plantations and scenic riverside charm.',
    mainImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'
  },
  {
    id: 6,
    nameEn: 'Preah Vihear',
    nameKh: 'ព្រះវិហារ',
    description: 'Home to the ancient Preah Vihear temple on a cliff.',
    mainImageUrl: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=600'
  },
  {
    id: 7,
    nameEn: 'Mondulkiri',
    nameKh: 'មណ្ឌលគីរី',
    description: 'Remote province with waterfalls and indigenous culture.',
    mainImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'
  },
  {
    id: 8,
    nameEn: 'Banteay Meanchey',
    nameKh: 'បន្ទាយ មាន់ចghostay',
    description: 'Border province with historical significance.',
    mainImageUrl: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=600'
  },
]

export const mockProvinceAttractions = {
  1: [ // Koh Kong
    {
      id: '1-1',
      provinceId: 1,
      nameEn: 'Tatai Waterfall',
      nameKh: 'ទឹកធ្លាក់ត៉ាតៃ',
      category: 'Waterfall',
      description: 'A spectacular multi-tiered waterfall located in the lush forests of Koh Kong Province.',
      location: 'Koh Kong Province',
      isHiddenGem: false,
      averageRating: 4.8
    },
    {
      id: '1-2',
      provinceId: 1,
      nameEn: 'Koh Kong Island',
      nameKh: 'កោះកង់',
      category: 'Beach',
      description: 'Beautiful island with pristine beaches.',
      location: 'Koh Kong Province',
      isHiddenGem: true,
      averageRating: 4.6
    },
    {
      id: '1-3',
      provinceId: 1,
      nameEn: 'Peam Krasoap Wildlife Sanctuary',
      nameKh: 'សរុកលួង',
      category: 'Nature',
      description: 'Protected area with mangroves and wildlife.',
      location: 'Koh Kong Province',
      isHiddenGem: true,
      averageRating: 4.4
    },
  ],
  2: [ // Phnom Penh
    {
      id: '2-1',
      provinceId: 2,
      nameEn: 'Royal Palace',
      nameKh: 'ព្រាសាទព្រះមហាក្សត្រ',
      category: 'Cultural',
      description: 'The official residence of the King of Cambodia.',
      location: 'Phnom Penh',
      isHiddenGem: false,
      averageRating: 4.7
    },
    {
      id: '2-2',
      provinceId: 2,
      nameEn: 'Killing Fields',
      nameKh: 'វាលប្រលក់',
      category: 'Cultural',
      description: 'Memorial to victims of the Khmer Rouge regime.',
      location: 'Phnom Penh',
      isHiddenGem: false,
      averageRating: 4.5
    },
    {
      id: '2-3',
      provinceId: 2,
      nameEn: 'Central Market',
      nameKh: 'បាលីផ្សារកណ្ដាល',
      category: 'Food',
      description: 'Bustling market with local crafts and street food.',
      location: 'Phnom Penh',
      isHiddenGem: false,
      averageRating: 4.3
    },
    {
      id: '2-4',
      provinceId: 2,
      nameEn: 'Silver Pagoda',
      nameKh: 'ព្រះវត្តលោកប្រាក់',
      category: 'Cultural',
      description: 'Temple with stunning silver floor.',
      location: 'Phnom Penh',
      isHiddenGem: true,
      averageRating: 4.6
    },
  ],
  3: [ // Siem Reap
    {
      id: '3-1',
      provinceId: 3,
      nameEn: 'Angkor Wat',
      nameKh: 'អង្គរវត្ត',
      category: 'Cultural',
      description: 'The largest religious monument in the world.',
      location: 'Siem Reap',
      isHiddenGem: false,
      averageRating: 4.9
    },
    {
      id: '3-2',
      provinceId: 3,
      nameEn: 'Tonle Sap Lake',
      nameKh: 'បឹងតោណលេសាប',
      category: 'Nature',
      description: 'Southeast Asia\'s largest freshwater lake.',
      location: 'Siem Reap',
      isHiddenGem: false,
      averageRating: 4.6
    },
    {
      id: '3-3',
      provinceId: 3,
      nameEn: 'Kbal Spean',
      nameKh: 'ក្បាលស្ពាន',
      category: 'Nature',
      description: 'The River of 1000 Lingas with underwater stone carvings.',
      location: 'Siem Reap',
      isHiddenGem: true,
      averageRating: 4.4
    },
    {
      id: '3-4',
      provinceId: 3,
      nameEn: 'Phnom Kulen',
      nameKh: 'ភ្នំគូលេន',
      category: 'Cultural',
      description: 'Sacred mountain with ancient temples and waterfalls.',
      location: 'Siem Reap',
      isHiddenGem: false,
      averageRating: 4.5
    },
    {
      id: '3-5',
      provinceId: 3,
      nameEn: 'Bantay Srei',
      nameKh: 'បន្ទាយស្រី',
      category: 'Cultural',
      description: 'Hidden temple with intricate pink sandstone carvings.',
      location: 'Siem Reap',
      isHiddenGem: true,
      averageRating: 4.7
    },
  ],
  4: [ // Sihanoukville
    {
      id: '4-1',
      provinceId: 4,
      nameEn: 'Sihanoukville Beach',
      nameKh: 'ឆ្នេរសីហនុ',
      category: 'Beach',
      description: 'Beautiful coastal town with pristine beaches.',
      location: 'Sihanoukville',
      isHiddenGem: false,
      averageRating: 4.5
    },
    {
      id: '4-2',
      provinceId: 4,
      nameEn: 'Bamboo Island',
      nameKh: 'កោះឈើឫស្សៀ',
      category: 'Beach',
      description: 'Pristine island with turquoise waters.',
      location: 'Sihanoukville',
      isHiddenGem: true,
      averageRating: 4.8
    },
    {
      id: '4-3',
      provinceId: 4,
      nameEn: 'Ream National Park',
      nameKh: 'សួនជាតិរៀម',
      category: 'Nature',
      description: 'Protected coastal park with beaches and forests.',
      location: 'Sihanoukville',
      isHiddenGem: true,
      averageRating: 4.4
    },
  ],
}

export const mockWeather = {
  tempCelsius: 28,
  conditionText: 'Partly Cloudy',
  iconUrl: 'https://cdn.weatherapi.com/weather/64x64/day/116.png',
  lastUpdated: new Date().toISOString()
}

export const mockWeatherAlerts: any[] = []
