import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { TaskDiscoveryItemDto } from '@team517/contracts';
import { taskAreaMarkers, taskAreaRegion } from '../utils/discovery-map';
import Constants from 'expo-constants';
import { Text } from './ui';
import { theme } from '../theme';

export function DiscoveryMap({ tasks, compact = false }: { tasks: readonly TaskDiscoveryItemDto[]; compact?: boolean }) {
  const [ready, setReady] = useState(false), [slow, setSlow] = useState(false);
  const map = useRef<MapView>(null);
  const markers = useMemo(() => taskAreaMarkers(tasks), [tasks]);
  const region = useMemo(() => taskAreaRegion(markers), [markers]);
  useEffect(() => { if (ready) map.current?.animateToRegion(region, 350); }, [ready, region]);
  const { height } = useWindowDimensions();
  useEffect(() => { const timer = setTimeout(() => setSlow(true), 15000); return () => clearTimeout(timer); }, []);
  if (Platform.OS !== 'android' || !Constants.expoConfig?.extra?.team517MapsConfigured) return <Text>Map is unavailable in this build. You can continue exploring tasks in List.</Text>;
  return <View style={{ gap: 8 }}>
    <Text style={{ fontSize: 13.5, color: theme.colors.muted }}>Approximate task areas · exact addresses stay private.</Text>
    <View style={{ height: compact ? 180 : Math.max(260, Math.min(420, height * .44)), borderRadius: 12, overflow: 'hidden', backgroundColor: theme.colors.primarySoft }}>
      <MapView ref={map} provider={PROVIDER_GOOGLE} style={StyleSheet.absoluteFill} initialRegion={region} maxZoomLevel={14} showsMyLocationButton={false} showsUserLocation={false} toolbarEnabled={false} showsIndoors={false} onMapLoaded={() => setReady(true)}>
        {markers.map(marker => <Marker key={marker.id} identifier={marker.id} coordinate={marker.coordinate} title={marker.title} description="Approximate task area" accessibilityLabel={`Approximate area: ${marker.title}`} pinColor={marker.urgent ? theme.colors.error : theme.colors.primary} />)}
      </MapView>
    </View>
    {tasks.length > markers.length && <Text style={{ fontSize: 13.5, color: theme.colors.muted }}>Some tasks have no map area. Switch to List to see every result.</Text>}
    {!ready && <Text accessibilityLiveRegion="polite" style={{ fontSize: 13.5, color: theme.colors.muted }}>{slow ? 'Map is taking longer to load. Check your connection or switch to List.' : 'Loading map…'}</Text>}
  </View>;
}

