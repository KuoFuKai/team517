import React from 'react';
import {View} from 'react-native';
import {Text} from './ui';
import {theme as t} from '../theme';
import type {TaskStatusPresentation} from '../utils/coordination';
export function CoordinationCard({value,children}:React.PropsWithChildren<{value:TaskStatusPresentation}>){
 return <View style={{backgroundColor:t.colors.accent,borderRadius:14,padding:16,gap:8}}>
  {value.nextActor!==value.title && <Text style={{fontSize:13,fontWeight:'600',color:t.colors.primary}}>{value.nextActor}</Text>}
  <Text accessibilityRole="header" style={{fontSize:23,lineHeight:29}}>{value.title}</Text>
  <Text>{value.summary}</Text>
  {value.nextActionLabel && <Text style={{fontWeight:'600'}}>Next step: {value.nextActionLabel}</Text>}
  <Text style={{fontWeight:'600',marginTop:4}}>What happens next?</Text>
  <Text>{value.supportingDetail}</Text>
  {children}
 </View>;
}
