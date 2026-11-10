package messages

import (
	"cmp"
	"slices"

	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
)

// sortedMessages orders a report without mutating the input, preserving input order for ties.
func sortedMessages(messages []types.Message) []types.Message {
	//

	//
	// 1. Sort a copy by file, rule, severity, description, and field

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
		return 0
	})

	return sorted
}
