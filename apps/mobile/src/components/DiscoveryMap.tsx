import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Constants from 'expo-constants';
import { Text } from './ui';
import { theme } from '../theme';

export function DiscoveryMap() {
  const [ready, setReady] = useState(false), [slow, setSlow] = useState(false);
  const { height } = useWindowDimensions();
  useEffect(() => { const timer = setTimeout(() => setSlow(true), 15000); return () => clearTimeout(timer); }, []);
  if (Platform.OS !== 'android' || !Constants.expoConfig?.extra?.team517MapsConfigured) return <Text>Map is unavailable in this build. You can continue exploring tasks in List.</Text>;
  return <View style={{ gap: 8 }}>
    <Text style={{ fontSize: 13.5, color: theme.colors.muted }}>Approximate task areas · exact addresses stay private.</Text>
    <View style={{ height: Math.max(260, Math.min(420, height * .44)), borderRadius: 12, overflow: 'hidden', backgroundColor: theme.colors.primarySoft }}>
      <MapView provider={PROVIDER_GOOGLE} style={StyleSheet.absoluteFill} initialRegion={{ latitude: 40.75, longitude: -73.96, latitudeDelta: .1, longitudeDelta: .1 }} maxZoomLevel={14} showsMyLocationButton={false} showsUserLocation={false} toolbarEnabled={false} showsIndoors={false} onMapLoaded={() => setReady(true)} />
    </View>
    {!ready && <Text accessibilityLiveRegion="polite" style={{ fontSize: 13.5, color: theme.colors.muted }}>{slow ? 'Map is taking longer to load. Check your connection or switch to List.' : 'Loading map…'}</Text>}
  </View>;
}

