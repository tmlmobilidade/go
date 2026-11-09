package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	"strconv"
)

/*
# Attributes

  - File: [transfers.txt], [stops.txt]
  - Field: [from_stop_id, transfer_type]
  - Presence: Conditionally Required, Required
  - Type: Foreign ID referencing stops.stop_id, Enum

# Description

  - from_stop_id: Identifies the origin stop or station for the connection. A station reference covers its child
    stops. Transfer types 4 and 5 must reference a stop rather than a station.
  - transfer_type: Connection policy: 0 or empty for a recommended transfer, 1 a timed transfer, 2 a transfer
    requiring min_transfer_time, 3 no transfer, 4 an in-seat transfer or 5 an in-seat transfer that is not allowed.

Validation: Checks the first matching stops.txt location. The location must be a stop/platform or station, with an
empty location_type treated as 0. Transfer types 4 and 5 require a stop/platform rather than a station. An
unreadable location type skips these conditions. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[transfers.txt]: https://gtfs.org/documentation/schedule/reference/#transferstxt
[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func TransfersFromStopIdForeign(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "transfers", "stops")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "transfers", []string{"from_stop_id", "transfer_type"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Get the from_stop_id, transfer_type, from_stop_id values

		fields, err := queries.Fields(rowCtx.Source, "from_stop_id", "transfer_type", "from_stop_id")
		if err != nil {
			return err
		}

		//
		// 3. Get the from_stop_id value

		value := fields["from_stop_id"]

		//
		// 4. Skip empty from_stop_id values

		if value == "" {
			return nil
		}

		//
		// 5. Check if the from_stop_id reference exists

		referenceExists1, err := queries.Exists(&sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "stops"}, "stop_id", value)
		if err != nil {
			return err
		}
		if !referenceExists1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_found", value))
			return nil
		}

		//
		// 6. Get the stops table

		stops := &sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "stops"}
		seen := false

		//
		// 7. Check the matching stops and their access restrictions

		err = queries.ForEachMatchingFields(stops, "stop_id", []any{value}, []string{"location_type"}, func(row *sqliteTypes.SQLiteRow, lookupValues map[string]string) error {
			row.Values = lookupValues
			if seen {
				return nil
			}
			seen = true
			location, err := queries.Field(row, "location_type")
			if err != nil {
				return err
			}
			locationType := 0
			if location != "" {
				locationType, err = strconv.Atoi(location)
				if err != nil {
					return nil
				}
			}
			if locationType != 0 && locationType != 1 {
				context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid_location_type", value, locationType))
				return nil
			}
			transferType, _ := strconv.Atoi(fields["transfer_type"])
			if (transferType == 4 || transferType == 5) && locationType != 0 {
				context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "must_be_stop_for_transfer_type_4_5", value, transferType))
				return nil
			}
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 8. Return success

		return nil
	})
}
