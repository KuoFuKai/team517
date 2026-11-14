import React, { useEffect,useState } from 'react';
import { View } from 'react-native';
import type { HelperTrustProfileDto,HelperTrustSummaryDto } from '@team517/contracts';
import * as api from '../api/client';
import { Avatar,Card,Text,Button,LoadingState,ErrorState } from '../components/ui';
import { useScreenHeader } from '../components/ScreenHeader';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { useScreenTop } from '../navigation/scroll';
import { dateLabel,friendlyError,countLabel } from '../utils/presentation';
import { theme as t } from '../theme';
import { ReviewsPanel } from './ReviewsPanel';
export function TrustSignals({value,relationship}:{value:HelperTrustSummaryDto;relationship?:'CARE_CIRCLE'|'EXTERNAL'}){
 return <View style={{gap:8}}><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{[...(relationship==='CARE_CIRCLE'?['Care Circle']:[]),value.verificationStatus==='VERIFIED'?'Verified Helper':value.verificationStatus==='PENDING'?'Verification pending':'Not verified'].map(label=><View key={label} style={{alignSelf:'flex-start',maxWidth:'100%',backgroundColor:t.colors.primarySoft,borderRadius:12,paddingVertical:5,paddingHorizontal:10}}><Text style={{fontSize:13.5,color:t.colors.primary,fontWeight:'600'}}>{label}</Text></View>)}</View><Text>{value.reviewCount && value.averageRating!==undefined ? `${value.averageRating.toFixed(1)} ★ · ${countLabel(value.reviewCount,'review')}` : 'No reviews yet'}</Text><Text>{countLabel(value.completedTaskCount,'completed task')}</Text></View>;
}
export function HelperTrustScreen({helperId,taskId,back,children}:{helperId:string;taskId?:string;back:()=>void;children?:React.ReactNode}){
 const [data,setData]=useState<HelperTrustProfileDto|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0);
 useScreenHeader({title:'Helper profile',back,priority:4});useHardwareBack(()=>{back();return true;},4);useScreenTop('helper-profile-'+helperId);
 useEffect(()=>{let active=true;setData(null);setError('');setLoading(true);void api.getHelperTrustProfile(helperId,taskId).then(value=>{if(active)setData(value);}).catch(e=>{if(active)setError(friendlyError(e));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[helperId,taskId,revision]);
 return <>{loading && <LoadingState label="Loading helper profile…"/>}{error ? <ErrorState message={error}/> : null}{data && <><Card><Avatar label={data.displayName}/><Text accessibilityRole="header" style={{fontSize:28,lineHeight:36}}>{data.displayName}</Text><TrustSignals value={data} relationship={data.relationship}/>{data.memberSince && <Text style={{color:t.colors.muted}}>On 517 since {new Date(data.memberSince+'-01T12:00:00Z').toLocaleDateString(undefined,{month:'short',year:'numeric'})}</Text>}</Card>
 <Text>Verification, completed tasks and reviews offer context for your decision.</Text>{data.relationship==='CARE_CIRCLE' && <Text>This helper belongs to this task’s care circle. Circle membership and verification are separate.</Text>}
 {children}
 <Text accessibilityRole="header">Recent reviews</Text>{data.recentReviews.length===0 ? <Card><Text>No reviews yet. You can still read their offer and message them before deciding.</Text></Card> : data.recentReviews.map(review=><Card key={review.id}><Text style={{fontWeight:'600'}}>{review.reviewerLabel}</Text><Text>{review.rating} ★ · {dateLabel(review.createdAt)}</Text><Text>{review.comment || 'No written comment'}</Text></Card>)}
 {data.reviewsTruncated && <ReviewsPanel helperId={helperId}/>}</>}
 <Button variant="quiet" title="Refresh profile" disabled={loading} onPress={()=>setRevision(value=>value+1)}/></>;
}
