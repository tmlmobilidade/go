package validationutils

import (
	"fmt"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
)

// RequireTables skips a rule when source or lookup data is unavailable.
func RequireTables(ctx *context.ValidationContext, names ...string) (bool, error) {
	if ctx == nil || ctx.DB == nil || ctx.MessageAdder == nil {
		return false, fmt.Errorf("validation requires a context, database, and message receiver")
	}
	for _, name := range names {
		exists, err := queries.TableExists(ctx.DB, name)
		if err != nil {
			return false, err
		}
		if !exists {
			ctx.Skipped = true
			return false, nil
		}
	}
	return true, nil
}

// Table identifies an existing table; SQL stays in the SQLite query package.
func Table(ctx *context.ValidationContext, name string) (*sqliteTypes.SQLiteTable, error) {
	exists, err := queries.TableExists(ctx.DB, name)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, fmt.Errorf("required table %s is missing", name)
	}
	return &sqliteTypes.SQLiteTable{DB: ctx.DB, Name: name}, nil
}

// ForEachGroup invokes a whole-group check once at its first source row.
// The seen set is private to one execution and never shared between rules.
func ForEachGroup(ctx *context.ValidationContext, table, key string, fields []string, check func(*context.ValidationContext) error) error {
	seen := map[string]bool{}
	return context.ForEachRow(ctx, table, fields, func(row *context.ValidationContext) error {
		value, err := queries.Field(row.Source, key)
		if err != nil {
			return err
		}
		if value == "" || seen[value] {
			return nil
		}
		seen[value] = true
		return check(row)
	})
}

func ForGroupFields(ctx *context.ValidationContext, field string, fields []string, check func(*sqliteTypes.SQLiteRow, map[string]string) error) error {
	key, err := queries.Field(ctx.Source, field)
	if err != nil {
		return err
	}
	if key == "" {
		return nil
	}
	return queries.ForEachMatchingFields(ctx.Source.Table, field, []any{key}, fields, check)
}

func ForGroup(ctx *context.ValidationContext, field string, check func(*sqliteTypes.SQLiteRow) error) error {
	return ForGroupFields(ctx, field, []string{field}, func(row *sqliteTypes.SQLiteRow, _ map[string]string) error { return check(row) })
}

// AddMessageAt preserves an offending member's source location and propagates failure.
func AddMessageAt(ctx *context.ValidationContext, field string, row int, message string) {
	finding := *ctx
	finding.Field, finding.Row = field, row
	context.AddMessage(&finding, message)
	ctx.Failed = ctx.Failed || finding.Failed
}
