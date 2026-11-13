import React from 'react';
import { Image } from 'react-native';
import { config } from '../config';
import { previewContent } from '../demo/preview-content-policy';
const photos: Record<string, number> = {
  planning: require('../../assets/demo-content/planning.jpg'), groceries: require('../../assets/demo-content/groceries.jpg'),
  meal: require('../../assets/demo-content/meal.jpg'), park: require('../../assets/demo-content/park.jpg'), books: require('../../assets/demo-content/books.jpg'),
};
export function PreviewContentCover({ kind, id, available = true, thumbnail = false, height = 176 }: { kind: 'task' | 'post' | 'resource'; id?: string; available?: boolean; thumbnail?: boolean; height?: number }) {
  const item = previewContent(config, kind, id, available);
  if (!item) return null;
  return <Image source={photos[item.photo]} accessibilityLabel="Illustrative photograph" resizeMode="cover" style={thumbnail ? { width: 64, height: 72, borderRadius: 10 } : { width: '100%', height, borderRadius: 12 }} />;
}
