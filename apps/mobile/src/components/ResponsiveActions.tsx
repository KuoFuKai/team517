import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { stackActions } from '../utils/responsive';

/** Uses measured container space, so nested cards and modal insets also work. */
export function ResponsiveActions({ children, minimum = 148 }: React.PropsWithChildren<{ minimum?: number }>) {
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const items = React.Children.toArray(children);
  const stacked = stackActions(width, fontScale, items.length, 12, minimum);
  return <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ flexDirection: stacked ? 'column' : 'row', gap: 12, alignItems: 'stretch' }}>
    {items.map((child, i) => <View key={i} style={{ flex: stacked ? undefined : 1, minWidth: 0 }}>{child}</View>)}
  </View>;
}
