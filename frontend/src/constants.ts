export type Level = 'Input' | 'Comprehension' | 'Imitation' | 'Prompted' | 'Spontaneous' | '';

export const levelColors: Record<Level, string> = {
  'Input': '#ead1dc',
  'Comprehension': '#d9d2e9',
  'Imitation': '#00ffff',
  'Prompted': '#ffff00',
  'Spontaneous': '#00ff00',
  '': '#ffffff', // Use white for no level
};

export const levelOrder: Level[] = ['Input', 'Comprehension', 'Imitation', 'Prompted', 'Spontaneous', ''];