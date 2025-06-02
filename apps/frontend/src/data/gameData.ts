
export const gameData = {
  wasteItems: [
    {
      id: '1',
      name: 'Plastic Bottle',
      category: 'plastic',
      image: '/placeholder.svg',
      description: 'Empty plastic water bottle'
    },
    {
      id: '2',
      name: 'Newspaper',
      category: 'paper',
      image: '/placeholder.svg',
      description: 'Old newspaper'
    },
    {
      id: '3',
      name: 'Apple Core',
      category: 'bio',
      image: '/placeholder.svg',
      description: 'Organic waste from fruit'
    },
    {
      id: '4',
      name: 'Glass Jar',
      category: 'glass',
      image: '/placeholder.svg',
      description: 'Empty glass container'
    },
    {
      id: '5',
      name: 'Battery',
      category: 'hazardous',
      image: '/placeholder.svg',
      description: 'Used AA battery'
    }
  ],
  
  bins: [
    { id: 'residual', name: 'Residual Waste', color: 'bg-gray-600' },
    { id: 'paper', name: 'Paper', color: 'bg-red-500' },
    { id: 'bio', name: 'Organic', color: 'bg-amber-600' },
    { id: 'plastic', name: 'Plastic & Metal', color: 'bg-yellow-500' },
    { id: 'glass', name: 'Glass', color: 'bg-green-600' },
    { id: 'hazardous', name: 'Hazardous', color: 'bg-orange-600' },
    { id: 'bulky', name: 'Bulky Waste', color: 'bg-purple-600' }
  ]
};
