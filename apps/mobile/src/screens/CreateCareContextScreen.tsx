import { useScreenHeader } from '../components/ScreenHeader';
import { Button, Text, TextInput, PageHeading } from '../components/ui';
import React, { useState } from 'react';


export function CreateCareContextScreen({ busy, create, back }: { back?: () => void; busy: boolean; create: (name: string) => void }) {
  useScreenHeader({ title: 'Create your circle', back, disabled: busy, priority: 2 });
  const [name, setName] = useState('');
  return <>
    <PageHeading title="A place for your care" caption="Give your care circle a name." />
    <TextInput accessibilityLabel="Care context name" placeholder="Mom's care" value={name} onChangeText={setName} maxLength={120} editable={!busy} />
    <Button disabled={busy || !name.trim()} variant="primary" title="Create circle" onPress={() => create(name.trim())} />
  </>;
}
