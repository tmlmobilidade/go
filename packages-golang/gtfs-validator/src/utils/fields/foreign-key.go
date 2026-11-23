package fields

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

// CheckForeignKey requires each supplied value to occur in the referenced column.
func CheckForeignKey(ctx context.Context, db *sql.DB, config types.Rule, table, column, targetTable, targetColumn string) (bool, []types.Finding, error) {
	exists, err := sqlutils.ColumnExists(ctx, db, table, column)
	if err != nil || !exists {
		return err == nil, nil, err
	}

	keys := make(map[string]struct{})
	err = ForEachValue(ctx, db, targetTable, targetColumn, func(_ int, value string) {
		keys[value] = struct{}{}
	})
	if err != nil {
		return false, nil, err
	}

	var findings []types.Finding
	err = ForEachValue(ctx, db, table, column, func(row int, value string) {
		if _, ok := keys[value]; !ok {
			findings = append(findings, types.Finding{
				Description: fmt.Sprintf("The %s references a missing %s.%s value.", column, targetTable, targetColumn),
				Message:     fmt.Sprintf("Unknown %s %q in %s.txt.", targetColumn, value, targetTable),
				Severity:    config.Severity,
				FileName:    table + ".txt",
				Field:       column,
				Rows:        []int{row},
			})
		}
	})
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}
