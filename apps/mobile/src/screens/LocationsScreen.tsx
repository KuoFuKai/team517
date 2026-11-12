import { theme } from '../theme';
import { Button, Text, TextInput } from '../components/ui';
import React, { useState } from 'react';

import type { CreateLocationRequest, LocationDto } from '@team517/contracts';

export function LocationsScreen({ locations, busy, create, back }: {
  locations: LocationDto[]; busy: boolean; create: (body: CreateLocationRequest) => void; back: () => void;
}) {
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  return <>
    <Text accessibilityRole="header">Care context locations</Text>
    {locations.map(location => <Text key={location.id}>{location.label} — {location.formattedAddress}</Text>)}
    <TextInput accessibilityLabel="Location label" placeholder="Home" maxLength={80} value={label} onChangeText={setLabel} editable={!busy} />
    <TextInput accessibilityLabel="Formatted address" placeholder="Street address" maxLength={500} value={address} onChangeText={setAddress} editable={!busy} />
    <Button disabled={busy || !label.trim() || !address.trim()} title="Create location" onPress={() => create({ label: label.trim(), formattedAddress: address.trim() })} />
    <Button disabled={busy} title="Back" onPress={back} />
    <Text>No maps or geocoding. Addresses are entered manually.</Text>
  </>;
}
