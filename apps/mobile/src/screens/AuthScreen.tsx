import React,{useRef,useState} from 'react';
import {View} from 'react-native';
import {Text,TextInput,Button,PageHeading,Card} from '../components/ui';
import {theme as t} from '../theme';
import {useScreenHeader} from '../components/ScreenHeader';
import {useHardwareBack} from '../navigation/useHardwareBack';
import {emailSignIn,resetPassword} from '../auth/email';
import {authError,resetSuccess,validEmail} from '../auth/policy';
import {socialAuth} from '../auth/providers';
import {SocialAuthButtons} from '../components/SocialAuthButtons';
export function AuthScreen(){
 const [mode,setMode]=useState<'landing'|'signin'|'signup'|'reset'|'privacy'|'terms'>('landing');
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');const lock=useRef(false);
 const navigate=(next:typeof mode)=>{if(lock.current)return;setMode(next);setError('');setNotice('');setPassword('');};
 const back=()=>navigate('landing');useScreenHeader({title:mode==='reset'?'Reset password':mode==='signup'?'Create account':mode==='signin'?'Sign in':mode==='privacy'?'Privacy':mode==='terms'?'Terms':'Help Me Help',back:mode==='landing'?undefined:back,priority:3,disabled:busy,enabled:mode!=='landing'});
 useHardwareBack(()=>{if(mode==='landing')return false;if(!busy)back();return true;},3);
 const run=async(work:()=>Promise<unknown>)=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');setNotice('');try{await work();}catch(e){setError(authError(e));}finally{lock.current=false;setBusy(false);}};
 if(mode==='privacy'||mode==='terms')return <><PageHeading title={mode==='privacy'?'Your privacy':'Using Help Me Help'} caption="Development Preview information"/><Card><Text>{mode==='privacy'?'This internal development app uses Firebase authentication and the existing cloud API. Public helper information and approximate task areas support coordination; exact arrival details require authorization. Use fictional information during testing.':'This is an internal Product Studio Preview. Use fictional requests and accounts for evaluation. It is not an emergency, medical-care or transportation service.'}</Text><Text>Final production {mode==='privacy'?'privacy policy':'terms'} and contact/retention details require team review before public distribution. This is not final legal copy or a compliance guarantee.</Text></Card><Button title="Back" onPress={back}/></>;
 return <View style={{gap:20,paddingBottom:24}}>
  <PageHeading title={mode==='landing'?'Help Me Help Network':mode==='signup'?'Start your circle of care':mode==='reset'?'Forgot your password?':'Welcome back'} caption={mode==='landing'?'Coordinate everyday help with people you trust. Make a request, find support, and know who is taking care of it.':mode==='signup'?'A little help starts with a simple account.':mode==='reset'?'Enter your email. We’ll help you get back in.':'Sign in to continue sharing care.'}/>
  {mode==='landing'?<><SocialAuthButtons busy={busy} act={p=>void run(()=>socialAuth(p))}/>{error?<Text accessibilityRole="alert">{error}</Text>:null}<Text style={{textAlign:'center'}}>or</Text><Button variant="primary" title="Continue with Email" disabled={busy} onPress={()=>navigate('signin')}/><Button title="Create an account" disabled={busy} onPress={()=>navigate('signup')}/></>:<>
   <TextInput accessibilityLabel="Email" placeholder="you@example.com" autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} editable={!busy}/>
   {mode!=='reset'&&<><TextInput accessibilityLabel="Password" secureTextEntry={!show} placeholder={mode==='signup'?'At least 6 characters':'Your password'} autoComplete={mode==='signup'?'new-password':'current-password'} value={password} onChangeText={setPassword} editable={!busy}/><Button variant="quiet" title={show?'Hide password':'Show password'} disabled={busy} onPress={()=>setShow(!show)}/>{mode==='signup'&&<Text style={{color:t.colors.muted}}>Use at least 6 characters.</Text>}</>}
   {error?<Text accessibilityRole="alert" accessibilityLiveRegion="polite">{error}</Text>:null}{notice?<Text accessibilityLiveRegion="polite">{notice}</Text>:null}
   <Button variant="primary" disabled={busy} title={busy?'Please wait…':mode==='signup'?'Create account':mode==='reset'?'Send reset instructions':'Sign in'} onPress={()=>{if(!validEmail(email)||(mode!=='reset'&&password.length<6)){setError(mode==='reset'?'Enter a valid email address.':'Enter a valid email and a password with at least 6 characters.');return;}void run(async()=>{if(mode==='reset'){await resetPassword(email);setNotice(resetSuccess);}else await emailSignIn(email,password,mode==='signup');});}}/>
   {mode==='signin'&&<Button title="Forgot password?" variant="quiet" disabled={busy} onPress={()=>navigate('reset')}/>}<Button title={mode==='signup'?'Already have an account? Sign in':mode==='reset'?'Back to sign in':'New here? Create an account'} disabled={busy} onPress={()=>navigate(mode==='signin'?'signup':'signin')}/>
  </>}
  <Text style={{color:t.colors.muted}}>By continuing, take a moment to review our Preview information.</Text><View style={{gap:8}}><Button variant="quiet" title="Privacy" disabled={busy} onPress={()=>navigate('privacy')}/><Button variant="quiet" title="Terms" disabled={busy} onPress={()=>navigate('terms')}/></View>
 </View>;
}
