import { View } from 'react-native';
import React, { useState } from 'react';
import { Text, TextInput, Button, Card, SectionHeader } from '../components/ui';
export function AuthScreen({ busy, authenticate }: { busy: boolean; authenticate: (email: string, password: string, register: boolean) => void }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [register, setRegister] = useState(false);
  const [validation, setValidation] = useState('');
  return <View style={{ gap: 18, paddingTop: 30, paddingBottom: 24 }}>
    <Text accessibilityRole="header" style={{ fontSize: 27, lineHeight: 35 }}>{register ? 'A little help starts here.' : 'Welcome back.'}</Text><Text>Make room for care, together.</Text>
    <View style={{ gap: 18, paddingTop: 12 }}>
      <TextInput accessibilityLabel="Email address" placeholder="you@example.com" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} editable={!busy} />
      <TextInput accessibilityLabel="Password" placeholder="At least 6 characters" secureTextEntry autoComplete={register ? 'new-password' : 'current-password'} value={password} onChangeText={setPassword} editable={!busy} />
      {validation ? <Text accessibilityRole="alert">{validation}</Text> : null}
      <Button variant="primary" disabled={busy} title={register ? 'Create account' : 'Sign in'} onPress={() => {
        if (!email.trim().includes('@') || password.length < 6) { setValidation('Enter your email and a password with at least 6 characters.'); return; }
        setValidation(''); authenticate(email.trim(), password, register);
      }} />
      <Button variant="quiet" disabled={busy} title={register ? 'Already have an account? Sign in' : 'New here? Create an account'} onPress={() => { setRegister(!register); setValidation(''); }} />
    </View><Text style={{ fontSize: 12, textAlign: 'center' }}>Connect with your circle and find support for everyday tasks.</Text>
  </View>;
}
