import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Map of Tailwind color classes to hex values
const tailwindColors = {
  'red-500': '#ef4444',
  'green-500': '#22c55e',
  'blue-500': '#3b82f6',
  'yellow-500': '#eab308',
  'purple-500': '#a855f7',
  'indigo-500': '#6366f1',
  'gray-500': '#64748b',
  'teal-500': '#14b8a6',
}

export const getTailwindColor = (colorClass) => {
  if (colorClass.startsWith('#')) return colorClass;
  return tailwindColors[colorClass] || '#64748b'; // Default to gray if color not found
};
