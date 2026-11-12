import { View } from 'react-native';
import React, { useState } from 'react';
import { Text, TextInput, Button, PageHeading } from '../components/ui';
import { theme as t } from '../theme';
export function AuthScreen({ busy, authenticate }: { busy: boolean; authenticate: (email: string, password: string, register: boolean) => void }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [register, setRegister] = useState(false), [validation, setValidation] = useState('');
  return <View style={{ flexGrow: 1, gap: 16, paddingBottom: 8 }}>
    <PageHeading title={register ? 'Create an account' : 'Welcome back'} caption={register ? 'Start building your circle of care.' : 'Log in with your email.'} />
    <View style={{ gap: 20, paddingTop: 8 }}>
      <TextInput accessibilityLabel="Email" placeholder="you@example.com" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} editable={!busy} />
      <TextInput accessibilityLabel="Password" placeholder={register ? 'At least 6 characters' : 'Enter your password'} secureTextEntry autoComplete={register ? 'new-password' : 'current-password'} value={password} onChangeText={setPassword} editable={!busy} />
      {validation ? <Text accessibilityRole="alert">{validation}</Text> : null}
    </View><View style={{ flexGrow: 1, minHeight: 48 }} />
    <Button variant="primary" disabled={busy} title={register ? 'Create account' : 'Sign in'} onPress={() => {
      if (!email.trim().includes('@') || password.length < 6) { setValidation('Enter your email and a password with at least 6 characters.'); return; }
      setValidation(''); authenticate(email.trim(), password, register);
    }} />
    <Button variant="secondary" disabled={busy} title={register ? 'Already have an account? Sign in' : 'Create an account'} onPress={() => { setRegister(!register); setValidation(''); }} />
    <Text style={{ fontSize: 13.5, color: t.colors.muted }}>{register ? 'Your account connects you with everyday support.' : 'New here? Start by creating your account.'}</Text>
  </View>;
}
