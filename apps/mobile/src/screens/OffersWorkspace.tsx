import { OfferAvailability } from '../components/OfferAvailability';
import { ScreenModal } from '../components/ScreenModal';
import { ResponsiveActions } from '../components/ResponsiveActions';
import { demoPerson } from '../demo/maker-day3';
import { HelperTrustScreen,TrustSignals } from './HelperTrustScreen';
import { ConfirmationSheet } from '../components/Feedback';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { useScreenTop } from '../navigation/scroll';
import { Disclosure } from '../components/Details';
import { useScreenHeader } from '../components/ScreenHeader';
import { personLabel,statusLabel,dateLabel,friendlyError,countLabel } from '../utils/presentation';
import { compensationLabel,taskWhenLabel } from '../utils/design-presentation';
import { selectionCopy } from '../utils/trust';
import { Card,Avatar,EmptyState,StatusBadge,Button,Text,PageHeading,LoadingState,ErrorState } from '../components/ui';
import { View,AppState } from 'react-native';
import { MessageEntry } from './MessageEntry';
import { ReviewsPanel } from './ReviewsPanel';
import React,{useEffect,useRef,useState} from 'react';
import type {OfferListDto,AssignmentDto,TaskDetailDto,OfferSummaryDto} from '@team517/contracts';
import * as api from '../api/client';
import { AssignmentPanel } from './AssignmentPanel';
import { theme as t } from '../theme';
const helperName=(offer:OfferSummaryDto)=>demoPerson(offer.helperId)?.name ?? offer.trust?.displayName ?? personLabel(offer.helperId);
function OfferTrust({offer}:{offer:OfferSummaryDto}){return offer.trust ? <TrustSignals value={offer.trust} relationship={offer.relationship}/> : <><Text>{statusLabel(offer.verificationStatus)}</Text><Text>{offer.reviewCount===0?'No reviews yet':offer.averageRating!==undefined?`${offer.averageRating.toFixed(1)} ★`:'View profile for experience and reviews.'}</Text></>;}
export function OffersWorkspace({taskId,task:taskDetails,back}:{taskId:string;task?:TaskDetailDto;back:()=>void}){
 const [data,setData]=useState<OfferListDto|null>(null),[assignment,setAssignment]=useState<AssignmentDto|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[selectedId,setSelectedId]=useState<string|null>(null),[profileId,setProfileId]=useState<string|null>(null),[confirmId,setConfirmId]=useState<string|null>(null),[confirmRevision,setConfirmRevision]=useState(0);
 const lock=useRef(false);
 useScreenHeader({title:assignment && !selectedId?'Your arrangement':selectedId?'Offer details':'Offers',back:selectedId?()=>setSelectedId(null):back,disabled:busy,priority:3});
 useScreenTop(selectedId ?? 'offers');useHardwareBack(()=>{if(selectedId){if(!busy)setSelectedId(null);return true;}return false;},3);
 const run=async(work:()=>Promise<void>)=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await work();}catch(e){setError(friendlyError(e));}finally{lock.current=false;setBusy(false);}};
 const load=async()=>{const list=await api.listOffers(taskId);setData(list);setAssignment(list.task.activeAssignmentId?await api.getAssignment(list.task.activeAssignmentId):null);};
 useEffect(()=>{void run(load);let active=true;const refresh=()=>{if(!lock.current && AppState.currentState==='active' && active)void load().catch(e=>{if(['FORBIDDEN','UNAUTHENTICATED'].includes(e?.code)){setData(null);setAssignment(null);setProfileId(null);setError(friendlyError(e));}});};const timer=setInterval(refresh,10000);const focus=AppState.addEventListener('change',state=>{if(state==='active')refresh();});return()=>{active=false;clearInterval(timer);focus.remove();};},[taskId]);
 const canSelect=(offer:OfferSummaryDto)=>offer.status==='ACTIVE' && !assignment && data?.task.status==='HAS_OFFERS' && !data.task.activeAssignmentId;
 const requestSelect=(offer:OfferSummaryDto,revision=offer.availabilityRevision ?? 0)=>{setError('');setConfirmRevision(revision);setConfirmId(offer.id);};
 const actions=(offer:OfferSummaryDto,revision=offer.availabilityRevision ?? 0)=><ResponsiveActions>{['ACTIVE','SELECTED'].includes(offer.status) && <MessageEntry taskId={taskId} otherUserId={offer.helperId}/>}
 {canSelect(offer) && <Button title={'Select '+helperName(offer)} variant="primary" disabled={busy} onPress={()=>requestSelect(offer,revision)}/>}</ResponsiveActions>;
 const choosing=data?.offers.find(o=>o.id===confirmId),copy=choosing?selectionCopy(helperName(choosing),choosing.availabilityFit):null;
 const confirmation=choosing && copy ? <ConfirmationSheet title={copy.title} message={copy.message} confirmLabel={copy.confirmLabel} dismissLabel="Cancel" dismissAccessibilityLabel="Cancel helper selection" confirmVariant="primary" busy={busy} error={error} dismiss={()=>{setConfirmId(null);setError('');}} confirm={()=>void run(async()=>{const result=await api.selectOffer(taskId,choosing.id,confirmRevision);setAssignment(result.assignment);setConfirmId(null);setProfileId(null);setSelectedId(null);await load();})}/> : null;
 const list=(offers:OfferSummaryDto[])=>offers.map(offer=><Card key={offer.id}><View style={{flexDirection:'row',gap:12,alignItems:'flex-start'}}><Avatar label={helperName(offer)}/><Text accessibilityRole="header" style={{flex:1,fontSize:22,lineHeight:30}}>{helperName(offer)}</Text></View>
   <OfferTrust offer={offer}/><OfferAvailability value={offer}/><Text style={{fontStyle:'italic'}} numberOfLines={4}>{offer.message || 'Offered to help with this task.'}</Text><StatusBadge status={offer.status}/>
   <ResponsiveActions minimum={128}><Button title="View profile" accessibilityLabel={'View profile of '+helperName(offer)} onPress={()=>setProfileId(offer.helperId)} disabled={busy}/>
   <Button variant="quiet" title="View offer" accessibilityLabel={'View offer from '+helperName(offer)} onPress={()=>setSelectedId(offer.id)} disabled={busy}/></ResponsiveActions>{actions(offer)}
 </Card>);
 const selected=data?.offers.find(o=>o.id===selectedId),profileOffer=data?.offers.find(o=>o.helperId===profileId);
 const profileModal=profileId ? <ScreenModal title="Helper profile" close={()=>{if(!busy)setProfileId(null);}}><HelperTrustScreen availabilityRevision={profileOffer?.availabilityRevision ?? 0} helperId={profileId} taskId={taskId} back={()=>{if(!busy)setProfileId(null);}}>{profile=><>{profileOffer && <><Card><Text accessibilityRole="header">Their offer</Text><Text>{profileOffer.message || 'Offered to help with this task.'}</Text><Text>Sent {dateLabel(profileOffer.createdAt)}</Text></Card>{actions(profileOffer,profile.taskAvailability?.availabilityRevision ?? 0)}</>}{error && !confirmId ? <ErrorState message={error}/> : null}</>}</HelperTrustScreen></ScreenModal> : null;
 return <>{profileModal}{confirmation}{busy && <LoadingState label="Loading offers…"/>}{error && !confirmId ? <ErrorState message={error}/> : null}
 {selected ? <><Card><Avatar label={helperName(selected)}/><Text accessibilityRole="header">{helperName(selected)}</Text><OfferTrust offer={selected}/><OfferAvailability value={selected}/></Card><Card><Text accessibilityRole="header">Their offer</Text><Text>{selected.message || 'Offered to help with this task.'}</Text><Text>Sent {dateLabel(selected.createdAt)}</Text><StatusBadge status={selected.status}/></Card><Button title="View helper profile" onPress={()=>setProfileId(selected.helperId)}/>{taskDetails && <Card><Text>{taskDetails.title}</Text><Text>{taskWhenLabel(taskDetails.startAt,taskDetails.endAt)}</Text><Text>{compensationLabel(taskDetails)}</Text></Card>}{actions(selected)}<Disclosure title="Reviews"><ReviewsPanel helperId={selected.helperId}/></Disclosure></>
 : assignment ? <><AssignmentPanel assignment={assignment} refresh={load} chooseAnother={load}/><Disclosure title="Backup offers">{list(data?.offers.filter(o=>o.status==='ACTIVE') ?? [])}</Disclosure></>
 : <><PageHeading title="Who can help?" caption={taskDetails?.title || 'Compare their experience and response to your task.'}/>{data && <Card><Text accessibilityRole="header">{countLabel(data.task.offerCount,'person','people')} can help</Text>{taskDetails && <Text>{compensationLabel(taskDetails)}</Text>}</Card>}{data?.offers.length===0 && <EmptyState title="No offers yet" message="Offers will appear here when someone responds."/>}{list(data?.offers ?? [])}<Text>Other offers stay available until your selected helper confirms.</Text></>}
 <Button variant="quiet" disabled={busy} title="Refresh offers" onPress={()=>void run(load)}/></>;
}
