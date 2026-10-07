import { useSyncExternalStore } from 'react';

// The backend caches GET /dashboard (which powers every list and total) for 10 minutes and does not
// invalidate it when data changes. After a write we tell the user so lists that lag are not a surprise.
let visible = false;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export const markListsStale = () => { if (!visible) { visible = true; emit(); } };
export const dismissStaleNotice = () => { if (visible) { visible = false; emit(); } };

const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const useStaleNotice = () => useSyncExternalStore(subscribe, () => visible, () => false);
