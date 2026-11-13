import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { locateOnce } from '../location/foreground';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { TaskDiscoveryItemDto } from '@team517/contracts';
import { taskAreaMarkers, taskAreaRegion, selectedDiscoveryTask, nextTaskAtArea } from '../utils/discovery-map';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { taskWhenLabel, compensationLabel, discoveryAreaLabel } from '../utils/design-presentation';
import { ResponsiveActions } from './ResponsiveActions';
import Constants from 'expo-constants';
import { Text, Card, Button } from './ui';
import { theme } from '../theme';

export function DiscoveryMap({ tasks, compact = false, open, busy = false }: { tasks: readonly TaskDiscoveryItemDto[]; compact?: boolean; open?: (task: TaskDiscoveryItemDto) => void; busy?: boolean }) {
  const [ready, setReady] = useState(false), [slow, setSlow] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<'IDLE' | 'BUSY' | 'AVAILABLE' | 'DENIED' | 'UNAVAILABLE'>('IDLE');
  const locationEpoch = useRef(0), locationLock = useRef(false);
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => { if (state !== 'active' && !locationLock.current) { locationEpoch.current++; setLocationState('IDLE'); } });
    return () => { locationEpoch.current++; listener.remove(); };
  }, []);
  const centerOnDevice = async () => {
    if (locationLock.current) return;
    locationLock.current = true; const epoch = ++locationEpoch.current; setLocationState('BUSY');
    try {
      const result = await locateOnce();
      if (epoch !== locationEpoch.current) return;
      if (result.status === 'AVAILABLE' && AppState.currentState !== 'active') { setLocationState('UNAVAILABLE'); return; }
      setLocationState(result.status);
      if (result.status === 'AVAILABLE') map.current?.animateToRegion({ ...result.coordinate, latitudeDelta: .06, longitudeDelta: .06 }, 350);
    } finally { locationLock.current = false; }
  };
  const selected = selectedDiscoveryTask(tasks, selectedId);
  useEffect(() => { if (!selected) setSelectedId(null); }, [selected]);
  useHardwareBack(() => { if (!selected) return false; setSelectedId(null); return true; }, 2);
  const map = useRef<MapView>(null);
  const markers = useMemo(() => taskAreaMarkers(tasks), [tasks]);
  const region = useMemo(() => taskAreaRegion(markers), [markers]);
  useEffect(() => { if (ready) map.current?.animateToRegion(region, 350); }, [ready, region.latitude, region.longitude, region.latitudeDelta, region.longitudeDelta]);
  const { height } = useWindowDimensions();
  useEffect(() => { const timer = setTimeout(() => setSlow(true), 15000); return () => clearTimeout(timer); }, []);
  if (Platform.OS !== 'android' || !Constants.expoConfig?.extra?.team517MapsConfigured) return <Text>Map is unavailable in this build. You can continue exploring tasks in List.</Text>;
  return <View style={{ gap: 8 }}>
    {!selected && <Text style={{ fontSize: 13.5, color: theme.colors.muted }}>Approximate task areas · exact addresses stay private.</Text>}
    {!compact && !selected && <Button variant="quiet" title={locationState === 'BUSY' ? 'Finding your location…' : 'Use my location'} disabled={busy || locationState === 'BUSY' || !ready} onPress={() => void centerOnDevice()} />}
    {!compact && !selected && locationState === 'DENIED' && <Text accessibilityLiveRegion="polite" style={{ fontSize: 13.5, color: theme.colors.muted }}>Location is optional. Keep browsing, or enable it in Android Settings.</Text>}
    {!compact && !selected && locationState === 'UNAVAILABLE' && <Text accessibilityLiveRegion="polite" style={{ fontSize: 13.5, color: theme.colors.muted }}>Your location is unavailable right now. Task areas and List still work.</Text>}
    {!compact && selected && <Card><Text accessibilityRole="header" style={{ fontSize: 18, fontWeight: '600' }}>{selected.title}</Text><Text style={{ fontSize: 13.5, color: theme.colors.muted }}>{taskWhenLabel(selected.startAt, selected.endAt)}</Text><Text style={{ fontSize: 13.5 }}>{compensationLabel(selected)} · {selected.urgency === 'URGENT' ? 'Urgent' : 'Planned'}{selected.distanceKm !== undefined ? ` · about ${selected.distanceKm} km` : ''}</Text><Text style={{ fontSize: 13.5, color: theme.colors.muted }}>{discoveryAreaLabel(selected.approximateLocation.areaLabel)}</Text><ResponsiveActions><Button variant="primary" title="View task" disabled={busy} onPress={() => open?.(selected)} /><Button variant="quiet" title="Clear selection" disabled={busy} onPress={() => setSelectedId(null)} /></ResponsiveActions>{markers.filter(m => m.coordinate.latitude === selected.approximateLocation.latitude && m.coordinate.longitude === selected.approximateLocation.longitude).length > 1 && <Button variant="quiet" title="Next task in this area" disabled={busy} onPress={() => setSelectedId(nextTaskAtArea(markers, selected.id, selectedId))} />}</Card>}
    <View style={{ height: compact ? 180 : selected ? 230 : Math.max(260, Math.min(420, height * .44)), borderRadius: 12, overflow: 'hidden', backgroundColor: theme.colors.primarySoft }}>
      <MapView ref={map} provider={PROVIDER_GOOGLE} style={StyleSheet.absoluteFill} initialRegion={region} maxZoomLevel={14} showsMyLocationButton={false} showsUserLocation={false} toolbarEnabled={false} showsIndoors={false} onMapLoaded={() => setReady(true)} onPress={event => { if (event.nativeEvent.action !== 'marker-press') setSelectedId(null); }}>
        {markers.map(marker => <Marker key={marker.id} identifier={marker.id} coordinate={marker.coordinate} zIndex={marker.id === selectedId ? 2 : 1} title={marker.title} description="Approximate task area" accessibilityLabel={`Approximate area: ${marker.title}`} pinColor={marker.id === selectedId ? theme.colors.terracotta : marker.urgent ? theme.colors.error : theme.colors.primary} onPress={event => { event.stopPropagation(); if (!compact && !busy) setSelectedId(current => nextTaskAtArea(markers, marker.id, current)); }} />)}
      </MapView>
    </View>
    {tasks.length > markers.length && <Text style={{ fontSize: 13.5, color: theme.colors.muted }}>Some tasks have no map area. Switch to List to see every result.</Text>}
    {!ready && <Text accessibilityLiveRegion="polite" style={{ fontSize: 13.5, color: theme.colors.muted }}>{slow ? 'Map is taking longer to load. Check your connection or switch to List.' : 'Loading map…'}</Text>}
  </View>;
}

