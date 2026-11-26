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
	var findings []types.Finding
	descriptionTranslation := types.NewTranslation("foreign_key", map[string]any{"field": column, "target_table": targetTable, "target_field": targetColumn})
	err := ForEachMissingForeignKey(ctx, db, table, column, targetTable, targetColumn, func(row int, value string) {
		findings = append(findings, types.Finding{
			Description:            fmt.Sprintf("The %s references a missing %s.%s value.", column, targetTable, targetColumn),
			DescriptionTranslation: descriptionTranslation,
			Message:                fmt.Sprintf("Unknown %s %q in %s.txt.", targetColumn, value, targetTable),
			MessageTranslation:     types.NewTranslation("unknown_reference", map[string]any{"target_field": targetColumn, "value": value, "file": targetTable + ".txt"}),
			Severity:               config.Severity,
			FileName:               table + ".txt",
			Field:                  column,
			Rows:                   []int{row},
		})
	})
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}

// ForEachMissingForeignKey visits nonblank source values absent from the target
// column. GTFS IDs are imported as text, so comparisons use the exact strings.
func ForEachMissingForeignKey(ctx context.Context, db *sql.DB, table, column, targetTable, targetColumn string, visit func(row int, value string)) error {
	exists, err := sqlutils.ColumnExists(ctx, db, table, column)
	if err != nil || !exists {
		return err
	}

	keys, err := sqlutils.ColumnTextSet(ctx, db, targetTable, targetColumn)
	if err != nil {
		return err
	}

	return ForEachValue(ctx, db, table, column, func(row int, value string) {
		if _, ok := keys[value]; !ok {
			visit(row, value)
		}
	})
}
