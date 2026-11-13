import manifest from './preview-content-manifest.json';
type Environment = { environment: string; firebaseProjectId: string };
export function previewContent(environment: Environment, kind: 'task' | 'post' | 'resource', id: string | undefined, available = true) {
  if (!available || !id || environment.environment !== 'PREVIEW' || environment.firebaseProjectId !== manifest.project) return undefined;
  return manifest.items.find(item => (kind === 'task' ? item.taskId : kind === 'post' ? item.postId : item.resourceId) === id);
}
export function previewPostAuthor(environment: Environment, post: { id: string; authorId: string; authorLabel: string; visibility: string; unavailable?: boolean; resource?: { id: string } }) {
  const item = previewContent(environment, 'post', post.id, post.visibility === 'PUBLIC_VERIFIED' && !post.unavailable && Boolean(post.resource));
  return item?.authorId === post.authorId ? item.authorName : post.authorLabel;
}
