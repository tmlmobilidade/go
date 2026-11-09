package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
* ParentStationForeign checks that a populated parent_station references a stop_id.
* Several child stops may reference the same station; that is not a duplicate ID.
 */
func ParentStationForeign(ctx *context.ValidationContext) error {
	return context.ForEachRow(ctx, "stops", []string{"parent_station"}, func(row *context.ValidationContext) error {
		if context.ShouldIgnore(row) {
			return nil
		}
		value, err := queries.Field(row.Source, "parent_station")
		if err != nil || value == "" {
			return err
		}
		exists, err := queries.Exists(row.Source.Table, "stop_id", value)
		if err != nil {
			return err
		}
		if !exists {
			context.AddMessage(row, context.GetTranslatedMessage(row, "not_found", value))
		}
		return nil
	})
}
