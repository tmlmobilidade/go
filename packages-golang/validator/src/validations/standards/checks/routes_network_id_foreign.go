package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [routes.txt], [route_networks.txt]
  - Field: network_id
  - Presence: Conditionally Forbidden
  - Type: ID

# Description

Identifies the network containing the route. Several routes can share the same network_id.

Conditionally Forbidden:
- Forbidden if the route_networks.txt or networks.txt file exists.
- Optional otherwise.

Validation: Checks that each populated network_id exists in route_networks.network_id. The current lookup uses
route_networks.txt rather than networks.txt, and skips the rule when that table is unavailable. Empty values are
skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard routes].

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
[route_networks.txt]: https://gtfs.org/documentation/schedule/reference/#route_networkstxt
[GTFS Standard routes]: https://gtfs.org/documentation/schedule/reference/#routestxt
*/
func NetworkIdForeign(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "routes", "route_networks")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "routes", []string{"network_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "network_id")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the network_id is foreign

		referenceExists1, err := queries.Exists(&sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "route_networks"}, "network_id", value)
		if err != nil {
			return err
		}
		if !referenceExists1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_found", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
