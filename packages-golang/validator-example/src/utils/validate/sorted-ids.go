package utils

import "slices"

// SortedIDs keeps validation errors deterministic when configurations contain several problems.
func SortedIDs[T any](entries map[string]T) []string {
	ids := make([]string, 0, len(entries))
	for id := range entries {
		ids = append(ids, id)
	}
	slices.Sort(ids)
	return ids
}
