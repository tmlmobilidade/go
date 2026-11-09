package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [trips.txt], [calendar.txt], [calendar_dates.txt]
  - Field: service_id
  - Presence: Required
  - Type: Foreign ID referencing calendar.service_id or calendar_dates.service_id

# Description

Identifies the operating dates of the trip, as defined by calendar.txt, calendar_dates.txt or both.

Validation: Checks that a populated service_id exists in calendar.txt or calendar_dates.txt. Either calendar is
sufficient for the lookup; the rule skips when neither table is available. Empty values are skipped; required-field
checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard trips].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[calendar.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar
[calendar_dates.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar-dates
[GTFS Standard trips]: https://gtfs.org/documentation/schedule/reference/#tripstxt
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
