import { colors, statusColors } from './colors';
import { spacing } from './spacing';

export const theme = {
  colors,
  statusColors,
  spacing,
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
  },
};

export type Theme = typeof theme;
