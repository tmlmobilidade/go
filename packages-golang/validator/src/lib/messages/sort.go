package messages

import (
	"cmp"
	"slices"

	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/messages"
)

// sortedMessages orders a report deterministically without mutating the input.
func sortedMessages(messages []types.Message) []types.Message {
	//

	//
	// 1. Sort a copy by file, rule, severity, description, field, and first row

	sorted := slices.Clone(messages)

	slices.SortStableFunc(sorted, func(a, b types.Message) int {
		if c := cmp.Compare(a.FileName, b.FileName); c != 0 {
			return c
		}
		if c := cmp.Compare(a.RuleID, b.RuleID); c != 0 {
			return c
		}
		if c := cmp.Compare(a.Severity, b.Severity); c != 0 {
			return c
		}
		if c := cmp.Compare(a.Message, b.Message); c != 0 {
			return c
		}
		if c := cmp.Compare(a.Field, b.Field); c != 0 {
			return c
		}
		return cmp.Compare(firstRow(a.Rows), firstRow(b.Rows))
	})

	return sorted
}

// firstRow provides a stable sort key for findings without row locations.
func firstRow(rows []int) int {
	//

	//
	// 1. Return the first row or zero when none exists

	if len(rows) == 0 {
		return 0
	}

	return rows[0]
}
