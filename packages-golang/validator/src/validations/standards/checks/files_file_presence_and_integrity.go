package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [routes.txt], [networks.txt], [route_networks.txt]
  - Field: network_id
  - Presence: Conditionally Forbidden
  - Type: ID

# Description

Identifies the network containing the route. Several routes can share the same network_id.

Conditionally Forbidden:
- Forbidden if the route_networks.txt or networks.txt file exists.
- Optional otherwise.

Validation: When any route has a populated network_id, reports each populated networks.txt or route_networks.txt
table once. Missing or empty network tables do not produce a finding. Per-file forbidden settings are handled by
the file-presence gates.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard routes].

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
[networks.txt]: https://gtfs.org/documentation/schedule/reference/#networkstxt
[route_networks.txt]: https://gtfs.org/documentation/schedule/reference/#route_networkstxt
[GTFS Standard routes]: https://gtfs.org/documentation/schedule/reference/#routestxt
*/
func FilePresenceAndIntegrity(ctx *contextTypes.ValidationContext) error {
	reported := map[string]bool{}
	return context.ForEachRow(ctx, "routes", []string{"network_id"}, func(row *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(row) {
			return nil
		}
		value, err := queries.Field(row.Source, "network_id")
		if err != nil || value == "" {
			return err
		}
		for _, table := range []string{"networks", "route_networks"} {
			if reported[table] {
				continue
			}
			exists, err := queries.TableExists(row.DB, table)
			if err != nil {
				return err
			}
			if !exists {
				continue
			}
			count, err := queries.CountRows(&sqliteTypes.SQLiteTable{DB: row.DB, Name: table})
			if err != nil {
				return err
			}
			if count == 0 {
				continue
			}
			finding := *row
			finding.FileName, finding.Field, finding.Row = table+".txt", "N/A", -1
			message := context.GetTranslatedMessage(&finding, "networks_forbidden_when_network_id")
			if table == "route_networks" {
				message = context.GetTranslatedMessage(&finding, "route_networks_forbidden_when_network_id")
			}
			context.AddMessage(&finding, message)
			row.Failed = row.Failed || finding.Failed
			reported[table] = true
		}
		return nil
	})
}
