import { useScreenHeader } from '../components/ScreenHeader';
import { Choices, Action, MenuRow } from '../components/Details';
import { Avatar } from '../components/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useScreenTop } from '../navigation/scroll';
import { useHardwareBack } from '../navigation/useHardwareBack';
import { Linking, View } from 'react-native';
import type { CommunityFeedDto, CommunityPostDto, CommunityPostDetailDto, CommunityPostType, ResourceDto, SavedResourcesDto, CareContextDto, TaskSummaryDto } from '@team517/contracts';
import * as api from '../api/client';
import { Button, Text, TextInput, Card, StatusBadge, SectionHeader, LoadingState, EmptyState, ErrorState } from '../components/ui';
import { dateLabel, friendlyError, statusLabel, countLabel } from '../utils/presentation';
export function CommunityScreen() {
  const [feed, setFeed] = useState<CommunityFeedDto | null>(null), [detail, setDetail] = useState<CommunityPostDetailDto | null>(null), [saved, setSaved] = useState<SavedResourcesDto | null>(null), [resource, setResource] = useState<ResourceDto | null>(null);
  const [circles, setCircles] = useState<CareContextDto[]>([]), [circleId, setCircleId] = useState<string | undefined>(), [filter, setFilter] = useState<CommunityPostType | undefined>();
  const [compose, setCompose] = useState<'NEED' | 'RESOURCE' | null>(null), [share, setShare] = useState<CommunityPostDto | null>(null), [taskCircle, setTaskCircle] = useState(''), [tasks, setTasks] = useState<TaskSummaryDto[]>([]), [taskId, setTaskId] = useState('');
  const [offered, setOffered] = useState<Record<string, boolean>>({});
  const [scopeVisible, setScopeVisible] = useState(false);
  const [body, setBody] = useState(''), [title, setTitle] = useState(''), [summary, setSummary] = useState(''), [url, setUrl] = useState(''), [category, setCategory] = useState('Everyday support'), [createdResource, setCreatedResource] = useState<string | null>(null);
  const [comment, setComment] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [commentError, setCommentError] = useState(''), [notice, setNotice] = useState(''); const lock = useRef(false);
  useScreenTop(detail?.post.id ?? resource?.id ?? (saved ? 'saved' : compose ?? share?.id ?? 'feed'));
  const scope = () => circleId ? { visibility: 'CARE_CIRCLE' as const, careContextId: circleId } : { visibility: 'PUBLIC_VERIFIED' as const };
  const run = async (work: () => Promise<void>, inlineComment = false) => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); setCommentError(''); setNotice(''); try { await work(); } catch (e) { if (inlineComment) setCommentError(friendlyError(e)); else setError(friendlyError(e)); } finally { lock.current = false; setBusy(false); } };
  // Audience/filter changes clear the old projection explicitly; same-audience refreshes
  // keep their content height so liking/saving does not jump the root ScrollView.
  const load = async () => { setFeed(await api.getCommunityFeed({ type: filter, careContextId: circleId })); };
  const reload = async () => { if (detail) setDetail(await api.getCommunityPost(detail.post.id)); else if (saved) setSaved(await api.getSavedResources()); else await load(); };
  useEffect(() => { let active = true; void api.listCareContexts().then(result => { if (active) setCircles(result.careContexts); }).catch(() => {}); void run(load); return () => { active = false; }; }, []);
  const resetEditor = () => { setBody(''); setTitle(''); setSummary(''); setUrl(''); setCreatedResource(null); setTaskId(''); setTasks([]); setShare(null); };
  const returnFeed = () => { setDetail(null); setSaved(null); setResource(null); setCompose(null); setShare(null); setComment(''); setMessage(''); setError(''); setNotice(''); void run(load); };
  useScreenHeader({ title: resource ? 'Resource' : compose || share ? 'New post' : saved ? 'Saved resources' : 'Post details', back: returnFeed, disabled: busy, priority: 2, enabled: Boolean(detail || resource || compose || share || saved) });
  useHardwareBack(() => { if (!detail && !saved && !resource && !compose && !share) return false; if (!busy) returnFeed(); return true; }, 1);
  const need = (post: CommunityPostDto) => {
    const task = post.taskPreview; if (!task) return <Text>This task is no longer accepting offers or is unavailable to you.</Text>;
    return <Card><StatusBadge status={task.status} /><Text accessibilityRole="header">{task.title}</Text><Text>{task.helpType} · {statusLabel(task.urgency)}</Text><Text>{dateLabel(task.startAt)} – {dateLabel(task.endAt)}</Text>{detail && <Text>{task.publicInstructions}</Text>}<Text>{statusLabel(task.compensationType)} {task.pointReward ?? task.cashAmount ?? ''} {task.currency ?? ''}</Text><Text>{task.approximateLocation.areaLabel} · {task.offerCount} offers</Text>
      <Button disabled={busy} title="View task" onPress={() => void run(async () => { setDetail(await api.getCommunityPost(post.id)); })} />
      {detail && <TextInput accessibilityLabel="Optional offer message" maxLength={1000} value={message} onChangeText={setMessage} editable={!busy} />}
      {detail && <Button disabled={busy || offered[task.id]} title={offered[task.id] ? 'Offer sent' : 'Offer to help'} onPress={() => void run(async () => { await api.offerHelp(task.id, message.trim() ? { message: message.trim() } : {}); setOffered(values => ({ ...values, [task.id]: true })); setMessage(''); setNotice('Offer sent. Return to Tasks → My offers to follow its status.'); await reload(); })} />}
    </Card>;
  };
  const resourceCard = (r: ResourceDto, compact = false) => compact ? <Card key={r.id}><MenuRow title={r.title} subtitle={r.category} onPress={() => void run(async () => setResource(await api.getResource(r.id)))} disabled={busy} /><Text numberOfLines={2}>{r.summary}</Text></Card> : <Card key={r.id}><Text accessibilityRole="header">{r.title}</Text><Text>{r.category}</Text><Text>{r.summary}</Text>
    <Button disabled={busy} title="View resource" onPress={() => void run(async () => setResource(await api.getResource(r.id)))} />
    <Button disabled={busy} title={r.saved ? 'Unsave resource' : 'Save resource'} onPress={() => void run(async () => { if (r.saved) await api.unsaveResource(r.id); else await api.saveResource(r.id); if (resource) setResource(await api.getResource(r.id)); else await reload(); })} />
    {r.url && <Button disabled={busy} title="Open external resource link" onPress={() => void run(async () => { const parsed = new URL(r.url!); if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Invalid URL'); await Linking.openURL(r.url!); })} />}
  </Card>;
  const preview = (post: CommunityPostDto, embedded = false): React.ReactNode => <Card key={post.id}><View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><Avatar label={post.authorLabel} /><View style={{ flex: 1 }}><Text style={{ fontWeight: '600' }}>{post.authorLabel}</Text><Text style={{ fontSize: 11 }}>{dateLabel(post.createdAt)} · {post.visibility === 'CARE_CIRCLE' ? 'Care circle' : 'Community'}</Text></View><StatusBadge status={post.type} /></View><Text accessibilityRole="header">{post.title || ({ NEED: 'A need in the community', RESOURCE: 'A resource to share', SHARE: 'A shared update' })[post.type]}</Text><Text>{post.body}</Text>
    {post.type === 'NEED' && need(post)}{post.resource && resourceCard(post.resource, !detail)}
    {post.type === 'SHARE' && (post.original ? <><Text>Original post by {post.original.authorLabel}</Text>{preview(post.original, true)}</> : <Text>Original post unavailable. Its content is not shown.</Text>)}
    {post.unavailable && post.type !== 'NEED' && <Text>Linked content is no longer available.</Text>}
    {!embedded && <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: .5, borderColor: '#DDD9D3' }}><Action disabled={busy} active={post.liked} icon="heart" title={`${post.likeCount} likes`} onPress={() => void run(async () => { if (post.liked) await api.unlikePost(post.id); else await api.likePost(post.id); await reload(); })} /><Action disabled={busy} icon="message-circle" title={`${post.commentCount} comments`} onPress={() => void run(async () => { setDetail(await api.getCommunityPost(post.id)); setComment(''); })} /><Action disabled={busy} icon="share-2" title="Share" onPress={() => { resetEditor(); setShare(post); }} /></View>}

  </Card>;
  return <>{!detail && !resource && !compose && !share && !saved && <Text style={{ color: '#596575', fontSize: 13 }}>A place to share needs, resources and everyday support.</Text>}
    {busy && <LoadingState />}{error ? <ErrorState message={error} /> : null}{notice ? <Card><Text>{notice}</Text></Card> : null}

    {resource ? resourceCard(resource) : compose || share ? <Card>
      <Text accessibilityRole="header">{share ? 'Share an update' : compose === 'NEED' ? 'Share an existing task' : 'Add a resource'}</Text><Text>Posting to {circleId ? circles.find(c => c.id === circleId)?.name || 'your circle' : 'verified Community'}. Circle content cannot be shared outside its original circle.</Text>
      {compose === 'NEED' && <><Text>Choose a task from a care circle. Only tasks you manage and that are accepting offers can be shared.</Text>{circles.map(c => <Button key={c.id} title={(taskCircle === c.id ? '✓ ' : '') + c.name} disabled={busy} onPress={() => void run(async () => { setTaskCircle(c.id); setTaskId(''); setTasks((await api.listTasks(c.id)).tasks.filter(t => ['OPEN', 'HAS_OFFERS'].includes(t.status))); })} />)}{tasks.map(t => <Button key={t.id} disabled={busy} title={(taskId === t.id ? '✓ ' : '') + (t.title || 'Task')} onPress={() => setTaskId(t.id)} />)}{taskCircle && tasks.length === 0 && <Text>No actionable tasks in this circle.</Text>}</>}
      {compose === 'RESOURCE' && <><TextInput accessibilityLabel="Resource title" maxLength={120} value={title} onChangeText={setTitle} editable={!busy && !createdResource} /><TextInput accessibilityLabel="Resource summary" multiline maxLength={2000} value={summary} onChangeText={setSummary} editable={!busy && !createdResource} /><TextInput accessibilityLabel="Category" maxLength={60} value={category} onChangeText={setCategory} editable={!busy && !createdResource} /><TextInput accessibilityLabel="Optional HTTPS URL" maxLength={2000} value={url} onChangeText={setUrl} autoCapitalize="none" editable={!busy && !createdResource} /></>}
      <TextInput accessibilityLabel={share ? 'Your share caption' : 'Post text'} multiline maxLength={3000} value={body} onChangeText={setBody} editable={!busy} />
      <Button disabled={busy || !body.trim() || (compose === 'NEED' && !taskId) || (compose === 'RESOURCE' && (!title.trim() || !summary.trim() || !category.trim()))} variant="primary" title={share ? 'Share update' : 'Publish post'} onPress={() => void run(async () => {
        let result: CommunityPostDto;
        if (share) result = await api.sharePost(share.id, { ...scope(), body: body.trim() });
        else if (compose === 'NEED') result = await api.createCommunityPost({ ...scope(), type: 'NEED', taskId, body: body.trim() });
        else { let resourceId = createdResource; if (!resourceId) { resourceId = (await api.createResource({ ...scope(), title: title.trim(), summary: summary.trim(), category: category.trim(), ...(url.trim() ? { url: url.trim() } : {}) })).id; setCreatedResource(resourceId); } result = await api.createCommunityPost({ ...scope(), type: 'RESOURCE', resourceId, body: body.trim() }); }
        setCompose(null); setShare(null); setDetail(await api.getCommunityPost(result.id)); setNotice('Posted to Community.');
      })} />
    </Card> : detail ? <>{preview(detail.post)}<SectionHeader title="Comments" />{detail.comments.comments.length === 0 && <EmptyState title="Start the conversation" message="Comments are shared with everyone who can view this post." />}{detail.comments.comments.map(c => <Card key={c.id}><Text>{c.authorLabel} · {dateLabel(c.createdAt)}</Text><Text>{c.body}</Text></Card>)}{detail.comments.truncated && <Text>Showing 50 recent comments.</Text>}<TextInput accessibilityLabel="Add a comment" multiline maxLength={1000} value={comment} onChangeText={setComment} editable={!busy} />{commentError ? <ErrorState message={commentError} /> : null}<Button title="Post comment" disabled={busy || !comment.trim()} onPress={() => void run(async () => { await api.commentOnPost(detail.post.id, { body: comment.trim() }); setComment(''); await reload(); }, true)} /></> : saved ? <><SectionHeader title="Saved resources" />{saved.resources.length === 0 && <EmptyState title="Nothing saved yet" message="Save a resource to return to it here." />}{saved.resources.map(r => resourceCard(r))}{saved.truncated && <Text>Showing 50 recent saves. Unavailable resources are omitted.</Text>}</> : <>
      <Choices value={filter ?? 'ALL'} options={[{ value: 'ALL', label: 'All' }, { value: 'NEED', label: 'Needs' }, { value: 'RESOURCE', label: 'Resources' }, { value: 'SHARE', label: 'Shares' }]} disabled={busy} change={value => { setFeed(null); setFilter(value === 'ALL' ? undefined : value); }} />
      <Button variant="quiet" disabled={busy} title={scopeVisible ? 'Hide audience choices' : `${circleId ? circles.find(c => c.id === circleId)?.name || 'Care circle' : 'Verified community'} · Change audience`} onPress={() => setScopeVisible(!scopeVisible)} />
      {scopeVisible && <Card><Button disabled={busy} title={!circleId ? '✓ Verified community' : 'Verified community'} onPress={() => { setFeed(null); setCircleId(undefined); }} />{circles.map(c => <Button key={c.id} disabled={busy} title={(circleId === c.id ? '✓ ' : '') + c.name} onPress={() => { setFeed(null); setCircleId(c.id); }} />)}</Card>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}><Action disabled={busy} icon="refresh-cw" title="Apply / refresh" onPress={() => void run(async () => { await load(); setScopeVisible(false); })} /><Action disabled={busy} icon="bookmark" title="Saved" onPress={() => void run(async () => setSaved(await api.getSavedResources()))} /><Action disabled={busy} icon="plus" title="Need" onPress={() => { resetEditor(); setCompose('NEED'); }} /><Action disabled={busy} icon="file-text" title="Resource" onPress={() => { resetEditor(); setCompose('RESOURCE'); }} /></View>
      {!busy && feed?.posts.length === 0 && <EmptyState title="A little sharing starts here" message="Share a task you manage or a useful resource." />}{feed?.posts.map(p => preview(p))}{feed?.truncated && <Text>Showing 30 recent posts. Production pagination is not yet available.</Text>}
    </>}
  </>;
}
