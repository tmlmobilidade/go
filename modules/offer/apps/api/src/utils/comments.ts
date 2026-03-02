import { Dates } from '@tmlmobilidade/dates';
import { Comment } from '@tmlmobilidade/types';
import { compareObjects } from '@tmlmobilidade/utils';

function shouldSkipKey(key: string, exclude?: string[]) {
	if (key === 'comments' || key === 'updated_at' || key === 'updated_by') return true;
	if (exclude?.includes(key)) return true;
	return false;
}

function isEmptyDiffNode(node: unknown): boolean {
	if (node == null) return true;

	// Leaf diff is never "empty"
	if (typeof node === 'object' && node !== null && 'curr_value' in (node) && 'prev_value' in (node)) {
		return false;
	}

	if (Array.isArray(node)) {
		// Empty if all items are empty
		return node.every(isEmptyDiffNode);
	}

	if (typeof node === 'object') {
		const entries = Object.entries(node as Record<string, unknown>);
		if (entries.length === 0) return true;
		return entries.every(([, v]) => isEmptyDiffNode(v));
	}

	// primitives shouldn't appear in your diff tree; treat as non-empty to be safe
	return false;
}

export function generateComments<T extends object>(
	prev: T,
	curr: Partial<T>,
	options: {
		excludeFields?: (keyof T | string)[]
		fieldsToTrack?: (keyof T | string)[]
		updatedBy: string
	},
): Comment[] {
	const diff = compareObjects(prev, curr);
	const now = Dates.now('utc').unix_timestamp;

	// Next state (needed to store "whole new version")
	const next = { ...prev, ...curr } as T;

	const exclude = options.excludeFields?.map(String);
	const track = options.fieldsToTrack?.map(String);

	// Top-level keys that changed are simply the keys present in `diff`
	const changedTopLevelKeys = Object.keys(diff).filter((key) => {
		if (shouldSkipKey(key, exclude)) return false;
		if (track && !track.includes(key)) return false;

		// Only count if there is an actual change under this key
		return !isEmptyDiffNode(diff[key]);
	});

	if (changedTopLevelKeys.length === 0) return [];

	const changes = changedTopLevelKeys.map(key => ({
		curr_value: next[key as keyof T],
		field: key,
		prev_value: prev[key as keyof T],
	}));

	return [{
		created_at: now,
		created_by: options.updatedBy,
		curr_value: null,
		field: 'multiple_fields',
		metadata: { changes },
		prev_value: null,
		type: 'field_changed' as const,
		updated_at: now,
	}];
}
