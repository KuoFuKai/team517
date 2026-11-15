import React,{useEffect,useState} from 'react';import {Platform,View} from 'react-native';
import * as Apple from 'expo-apple-authentication';
import {Button,Text} from './ui';
import {googleAvailable,type SocialProvider} from '../auth/providers';
export function SocialAuthButtons({busy,act,link=false}:{busy:boolean;act:(provider:SocialProvider)=>void;link?:boolean}){
 const [apple,setApple]=useState(false);useEffect(()=>{let active=true;if(Platform.OS==='ios')void Apple.isAvailableAsync().then(v=>{if(active)setApple(v);}).catch(()=>{});return()=>{active=false;};},[]);
 return <View style={{gap:12}}>{apple&&<View pointerEvents={busy?'none':'auto'} accessibilityState={{disabled:busy}}><Apple.AppleAuthenticationButton buttonType={link?Apple.AppleAuthenticationButtonType.CONTINUE:Apple.AppleAuthenticationButtonType.SIGN_IN} buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK} cornerRadius={10} style={{height:52,width:'100%',opacity:busy ? 0.5 : 1}} onPress={()=>act('apple.com')}/></View>}<Button title={link?'Connect Google':'Continue with Google'} disabled={busy||!googleAvailable()} onPress={()=>act('google.com')}/>{!googleAvailable()&&<Text>Google is currently unavailable. You can continue with email.</Text>}</View>;
}
