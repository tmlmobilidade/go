package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	"strconv"
)

/*
# Attributes

  - File: [pathways.txt], [stops.txt]
  - Field: to_stop_id
  - Presence: Required
  - Type: Foreign ID referencing stops.stop_id

# Description

Location where the pathway ends. It must reference a platform, entrance/exit, generic node or boarding area.
Stations and platforms with stop_access=1 must not be used.

Validation: Checks the first matching stops.txt location. Stations are rejected; accepted location types are 0 or
empty, 2, 3 and 4. A platform with stop_access=1 is rejected; empty access is treated as 0. Malformed location_type
or stop_access values stop this comparison without a finding. Empty values are skipped; required-field checks
handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[pathways.txt]: https://gtfs.org/documentation/schedule/reference/#pathwaystxt
[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func PathwaysToStopIdForeign(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "pathways", "stops")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "pathways", []string{"to_stop_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "to_stop_id")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty to_stop_id values

		if value == "" {
			return nil
		}

		//
		// 3. Get the stops table

		table := &sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "stops"}
		found := false

		//
		// 4. Check the matching stops and their access restrictions

		err = queries.ForEachMatchingFields(table, "stop_id", []any{value}, []string{"location_type", "stop_access"}, func(row *sqliteTypes.SQLiteRow, lookupValues map[string]string) error {
			row.Values = lookupValues
			if found {
				return nil
			}
			found = true
			values, err := queries.Fields(row, "location_type", "stop_access")
			if err != nil {
				return err
			}
			locationType := 0
			if values["location_type"] != "" {
				locationType, err = strconv.Atoi(values["location_type"])
				if err != nil { // Stop format is validated by the stops checks.
					return nil
				}
			}
			if locationType == 1 {
				context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid_location_type_station", value))
				return nil
			}
			if locationType != 0 && locationType != 2 && locationType != 3 && locationType != 4 {
				context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid_location_type_pathway", value, locationType))
				return nil
			}
			if locationType == 0 {
				access := 0
				if values["stop_access"] != "" {
					access, err = strconv.Atoi(values["stop_access"])
					if err != nil { // Stop format is validated by the stops checks.
						return nil
					}
				}
				if access == 1 {
					context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "forbidden_stop_access_1", value))
				}
			}
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 5. Report a missing to_stop_id reference

		if !found {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_found", value))
		}

		//
		// 6. Return success

		return nil
	})
}
