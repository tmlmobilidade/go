package utils

import "slices"

// retainedRows bounds the displayed sample while preserving the latest occurrence.
func RetainedRows(rows []int) []int {
	//

	//
	// 1. Keep up to 100 rows, with the latest occurrence in the last slot

	if len(rows) > 100 {
		rows[99] = rows[len(rows)-1]
		return slices.Clone(rows[:100])
	}
	return rows
}
