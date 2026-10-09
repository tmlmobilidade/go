import { type BottomSheetNavigationEntry } from '@/types/common/bottom-sheet';

/* * */

export type BottomSheetNavigationAction =
  | { entries: BottomSheetNavigationEntry[], type: 'restore' }
  | { entry: BottomSheetNavigationEntry, type: 'push' }
  | { entry: BottomSheetNavigationEntry, type: 'replace-active' }
  | { type: 'clear' }
  | { type: 'pop' };

/* * */

export function reduceBottomSheetNavigation(stack: BottomSheetNavigationEntry[], action: BottomSheetNavigationAction): BottomSheetNavigationEntry[] {
	switch (action.type) {
		case 'clear':
			return stack.length ? [] : stack;
		case 'pop':
			return stack.length ? stack.slice(0, -1) : stack;
		case 'push': {
			const entry = normalizeBottomSheetNavigationEntry(action.entry);
			const activeEntry = stack.at(-1);
			if (activeEntry?.view !== entry.view) return [...stack, entry];
			// Avoid stacking sheets when switching between entities of the same type.
			if ((activeEntry.entityId ?? null) === entry.entityId) return stack;
			return replaceActiveEntry(stack, entry);
		}
		case 'replace-active':
			return replaceActiveEntry(stack, normalizeBottomSheetNavigationEntry(action.entry));
		case 'restore':
			return action.entries.map(normalizeBottomSheetNavigationEntry);
	}
}

/* * */

function normalizeBottomSheetNavigationEntry(entry: BottomSheetNavigationEntry): BottomSheetNavigationEntry {
	return { entityId: entry.entityId ?? null, view: entry.view };
}

function replaceActiveEntry(stack: BottomSheetNavigationEntry[], entry: BottomSheetNavigationEntry): BottomSheetNavigationEntry[] {
	return stack.length ? [...stack.slice(0, -1), entry] : [entry];
}
