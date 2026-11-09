package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
* TripsServiceIdForeign accepts a service found in either available calendar table.
* Missing calendar sources skip the rule; empty service IDs belong to field checks.
 */
func TripsServiceIdForeign(ctx *context.ValidationContext) error {
	ready, err := context.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}
	tables := []*sqliteTypes.SQLiteTable{}
	for _, name := range []string{"calendar", "calendar_dates"} {
		exists, err := queries.TableExists(ctx.DB, name)
		if err != nil {
			return err
		}
		if exists {
			tables = append(tables, &sqliteTypes.SQLiteTable{DB: ctx.DB, Name: name})
		}
	}
	if len(tables) == 0 {
		ctx.Skipped = true
		return nil
	}
	return context.ForEachRow(ctx, "trips", []string{"service_id"}, func(row *context.ValidationContext) error {
		if context.ShouldIgnore(row) {
			return nil
		}
		value, err := queries.Field(row.Source, "service_id")
		if err != nil || value == "" {
			return err
		}
		for _, table := range tables {
			exists, err := queries.Exists(table, "service_id", value)
			if err != nil {
				return err
			}
			if exists {
				return nil
			}
		}
		context.AddMessage(row, context.GetTranslatedMessage(row, "not_found", value))
		return nil
	})
}
