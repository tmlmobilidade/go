package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [trips.txt], [routes.txt]
  - Field: route_id
  - Presence: Required
  - Type: Foreign ID referencing routes.route_id

# Description

Identifies the route to which the trip belongs.

Validation: Checks that each non-empty route_id exists in routes.route_id. It compares the original text without
trimming whitespace or normalizing letter case. The presence of the referenced value is separate from its format.
Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard trips].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
[GTFS Standard trips]: https://gtfs.org/documentation/schedule/reference/#tripstxt
*/
func TripsRouteIdForeign(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "trips", "routes")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "trips", []string{"route_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "route_id")
		if err != nil {
			return err
		}

		//
		// 2. Requiredness is checked by the field rule.

		if value == "" {
			return nil
		}

		//
		// 3. Check if the route_id exists in the routes table

		referenceExists1, err := queries.Exists(&sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "routes"}, "route_id", value)
		if err != nil {
			return err
		}
		if !referenceExists1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_found", value))
		}

		//
		// 4. Return success

		return nil
	})
}
