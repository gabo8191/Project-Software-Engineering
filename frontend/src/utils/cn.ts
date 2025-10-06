import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that merges multiple class names together
 * using clsx and tailwind-merge, providing a clean way to
 * conditionally apply classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}