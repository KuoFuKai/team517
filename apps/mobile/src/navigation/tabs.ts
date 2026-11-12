export type MainTab = 'tasks' | 'calendar' | 'discover' | 'circle' | 'me' | 'community' | 'post' | 'messages';
type NavigationItem = { id: MainTab; label: string; icon: 'calendar' | 'home' | 'plus' | 'users' | 'user' | 'search' | 'message-circle' };
export function navigationItems(helper: boolean): NavigationItem[] {
  return [
    { id: 'tasks', label: 'Tasks', icon: 'calendar' },
    { id: 'community', label: 'Community', icon: 'home' },
    helper ? { id: 'discover', label: 'Find', icon: 'search' } : { id: 'post', label: 'Post', icon: 'plus' },
    helper ? { id: 'messages', label: 'Messages', icon: 'message-circle' } : { id: 'circle', label: 'Circle/Msg', icon: 'users' },
    { id: 'me', label: 'Me', icon: 'user' },
  ];
}
