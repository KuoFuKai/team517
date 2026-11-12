import { Disclosure } from '../components/Details';
import { Card, SectionHeader, PageHeading } from '../components/ui';
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
    <PageHeading title="Add another location" caption="Add another place for help." /><Disclosure title="Saved locations">
    {locations.map(location => <Card key={location.id}><Text style={{ fontWeight: '600' }}>{location.label}</Text><Text>{location.formattedAddress}</Text></Card>)}
    </Disclosure><TextInput accessibilityLabel="Location name" placeholder="Home" maxLength={80} value={label} onChangeText={setLabel} editable={!busy} />
    <TextInput accessibilityLabel="Address" placeholder="Street address" maxLength={500} value={address} onChangeText={setAddress} editable={!busy} />
    <Button disabled={busy || !label.trim() || !address.trim()} variant="primary" title="Add this address" onPress={() => create({ label: label.trim(), formattedAddress: address.trim() })} />
    <Text style={{ color: theme.colors.muted, fontSize: 13.5 }}>Enter the address manually.</Text>
  </>;
}
