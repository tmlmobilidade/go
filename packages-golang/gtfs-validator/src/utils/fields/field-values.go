package fields

import (
	"context"
	"database/sql"
	"fmt"
	"slices"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

// ForEachValue visits nonblank values in the named column in source row order.
func ForEachValue(ctx context.Context, db *sql.DB, table, column string, visit func(row int, value string)) error {
	hasColumn, err := sqlutils.ColumnExists(ctx, db, table, column)
	if err != nil || !hasColumn {
		return err
	}
	return sqlutils.ForEachRow(ctx, db, table, []string{column}, func(row int, values map[string]string) error {
		value := values[column]
		if strings.TrimSpace(value) != "" {
			visit(row, value)
		}
		return nil
	})
}

// CheckValues reports each supplied value that fails the predicate.
func CheckValues(ctx context.Context, db *sql.DB, config types.Rule, table, column, description string, valid func(string) bool) (bool, []types.Finding, error) {
	return checkValues(ctx, db, config, table, column, description, types.NewTranslation("default", nil), valid)
}

// CheckForbiddenValues reports supplied values for fields that must be empty.
func CheckForbiddenValues(ctx context.Context, db *sql.DB, config types.Rule, table, column string) (bool, []types.Finding, error) {
	return checkValues(ctx, db, config, table, column, fmt.Sprintf("The %s field must be empty.", column),
		types.NewTranslation("field_forbidden", map[string]any{"field": column}), func(string) bool { return false })
}

func checkValues(ctx context.Context, db *sql.DB, config types.Rule, table, column, description string, translation *types.Translation, valid func(string) bool) (bool, []types.Finding, error) {
	var findings []types.Finding
	err := ForEachValue(ctx, db, table, column, func(row int, value string) {
		if !valid(value) {
			findings = append(findings, types.Finding{
				Description:            description,
				DescriptionTranslation: translation,
				Severity:               config.Severity,
				Message:                fmt.Sprintf("Invalid %s value %q.", column, value),
				MessageTranslation:     types.NewTranslation("invalid_field_value", map[string]any{"field": column, "value": value}),
				FileName:               table + ".txt",
				Field:                  column,
				Rows:                   []int{row},
			})
		}
	})
	if err != nil {
		return false, nil, err
	}
	return len(findings) == 0, findings, nil
}

// CheckOptions checks supplied values against the configured options.
func CheckOptions(ctx context.Context, db *sql.DB, config types.Rule, table, column string) (bool, []types.Finding, error) {
	options := config.Options()
	if options == nil || slices.Contains(options, "all_options") {
		return true, nil, nil
	}
	return checkValues(ctx, db, config, table, column, fmt.Sprintf("The %s field contains a value outside the configured options.", column),
		types.NewTranslation("field_options", map[string]any{"field": column}), func(value string) bool {
			return slices.Contains(options, value)
		})
}
