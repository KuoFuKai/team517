import React, { useState } from 'react';
import { Text, TextInput, Button, Card, SectionHeader } from '../components/ui';
export function AuthScreen({ busy, authenticate }: { busy: boolean; authenticate: (email: string, password: string, register: boolean) => void }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [register, setRegister] = useState(false);
  const [validation, setValidation] = useState('');
  return <>
    <SectionHeader title={register ? 'A little help starts here.' : 'Welcome back.'} caption="Make room for care, together." />
    <Card><Text accessibilityRole="header">{register ? 'Create your account' : 'Sign in to 517'}</Text>
      <TextInput accessibilityLabel="Email address" placeholder="you@example.com" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} editable={!busy} />
      <TextInput accessibilityLabel="Password" placeholder="At least 6 characters" secureTextEntry autoComplete={register ? 'new-password' : 'current-password'} value={password} onChangeText={setPassword} editable={!busy} />
      {validation ? <Text accessibilityRole="alert">{validation}</Text> : null}
      <Button variant="primary" disabled={busy} title={register ? 'Create account' : 'Sign in'} onPress={() => {
        if (!email.trim().includes('@') || password.length < 6) { setValidation('Enter your email and a password with at least 6 characters.'); return; }
        setValidation(''); authenticate(email.trim(), password, register);
      }} />
      <Button variant="quiet" disabled={busy} title={register ? 'Already have an account? Sign in' : 'New here? Create an account'} onPress={() => { setRegister(!register); setValidation(''); }} />
    </Card><Text>Connect with your circle and find support for everyday tasks.</Text>
  </>;
}
