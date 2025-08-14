// Set color definitions for visual distinction
export const SET_COLORS = [
  'blue',
  'green', 
  'purple',
  'orange',
  'red',
  'teal',
  'pink',
  'indigo'
] as const;

export type SetColor = typeof SET_COLORS[number];

export const getSetColorClasses = (color: string, variant: 'light' | 'medium' | 'dark' = 'medium') => {
  const colorMap = {
    blue: {
      light: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300',
      medium: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
      dark: 'bg-blue-500 border-blue-600 text-white dark:bg-blue-600 dark:border-blue-500'
    },
    green: {
      light: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300',
      medium: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
      dark: 'bg-green-500 border-green-600 text-white dark:bg-green-600 dark:border-green-500'
    },
    purple: {
      light: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300',
      medium: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-200',
      dark: 'bg-purple-500 border-purple-600 text-white dark:bg-purple-600 dark:border-purple-500'
    },
    orange: {
      light: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300',
      medium: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200',
      dark: 'bg-orange-500 border-orange-600 text-white dark:bg-orange-600 dark:border-orange-500'
    },
    red: {
      light: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300',
      medium: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
      dark: 'bg-red-500 border-red-600 text-white dark:bg-red-600 dark:border-red-500'
    },
    teal: {
      light: 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950 dark:border-teal-800 dark:text-teal-300',
      medium: 'bg-teal-100 border-teal-300 text-teal-800 dark:bg-teal-900 dark:border-teal-700 dark:text-teal-200',
      dark: 'bg-teal-500 border-teal-600 text-white dark:bg-teal-600 dark:border-teal-500'
    },
    pink: {
      light: 'bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-950 dark:border-pink-800 dark:text-pink-300',
      medium: 'bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-900 dark:border-pink-700 dark:text-pink-200',
      dark: 'bg-pink-500 border-pink-600 text-white dark:bg-pink-600 dark:border-pink-500'
    },
    indigo: {
      light: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300',
      medium: 'bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-200',
      dark: 'bg-indigo-500 border-indigo-600 text-white dark:bg-indigo-600 dark:border-indigo-500'
    }
  };

  return colorMap[color as keyof typeof colorMap]?.[variant] || colorMap.blue[variant];
};

export const getSetColor = (setIndex: number): SetColor => {
  return SET_COLORS[setIndex % SET_COLORS.length];
};