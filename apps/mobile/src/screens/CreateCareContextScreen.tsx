import { Button, Text, TextInput } from '../components/ui';
import React, { useState } from 'react';


export function CreateCareContextScreen({ busy, create }: { busy: boolean; create: (name: string) => void }) {
  const [name, setName] = useState('');
  return <>
    <Text>Create care context</Text>
    <TextInput accessibilityLabel="Care context name" placeholder="Mom's care" value={name} onChangeText={setName} maxLength={120} editable={!busy} />
    <Button disabled={busy || !name.trim()} title="Save care context" onPress={() => create(name.trim())} />
  </>;
}
