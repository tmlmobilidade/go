package fields

import (
	"context"
	"database/sql"
	"fmt"
	"maps"
	"slices"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

// CheckUnique reports one finding per repeated nonblank value.
func CheckUnique(ctx context.Context, db *sql.DB, config types.Rule, table, column string) (bool, []types.Finding, error) {
	rowsByValue := make(map[string][]int)
	err := ForEachValue(ctx, db, table, column, func(row int, value string) {
		rowsByValue[value] = append(rowsByValue[value], row)
	})
	if err != nil {
		return false, nil, err
	}

	var findings []types.Finding
	for _, value := range slices.Sorted(maps.Keys(rowsByValue)) {
		rows := rowsByValue[value]
		if len(rows) > 1 {
			findings = append(findings, types.Finding{
				Description: fmt.Sprintf("The %s field contains duplicate values.", column),
				Severity:    config.Severity,
				Message:     fmt.Sprintf("The %s value %q is used on multiple rows.", column, value),
				FileName:    table + ".txt",
				Field:       column,
				Rows:        rows,
			})
		}
	}
	return len(findings) == 0, findings, nil
}
