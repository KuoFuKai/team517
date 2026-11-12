import { Card, SectionHeader } from '../components/ui';
import { useScreenHeader } from '../components/ScreenHeader';
import { theme } from '../theme';
import { Button, Text, TextInput } from '../components/ui';
import React, { useState } from 'react';

import type { CreateLocationRequest, LocationDto } from '@team517/contracts';

export function LocationsScreen({ locations, busy, create, back }: {
  locations: LocationDto[]; busy: boolean; create: (body: CreateLocationRequest) => void; back: () => void;
}) {
  useScreenHeader({ title: 'Care locations', back, disabled: busy, priority: 3 });
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  return <>
    <Text style={{ color: theme.colors.muted }}>Private locations for your care circle.</Text>
    {locations.map(location => <Card key={location.id}><Text style={{ fontWeight: '600' }}>{location.label}</Text><Text>{location.formattedAddress}</Text></Card>)}
    <SectionHeader title="Add a location" /><TextInput accessibilityLabel="Location label" placeholder="Home" maxLength={80} value={label} onChangeText={setLabel} editable={!busy} />
    <TextInput accessibilityLabel="Formatted address" placeholder="Street address" maxLength={500} value={address} onChangeText={setAddress} editable={!busy} />
    <Button disabled={busy || !label.trim() || !address.trim()} title="Create location" onPress={() => create({ label: label.trim(), formattedAddress: address.trim() })} />
    <Button disabled={busy} title="Back" onPress={back} />
    <Text>No maps or geocoding. Addresses are entered manually.</Text>
  </>;
}
