package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
* FilePresenceAndIntegrity reports incompatible network files when routes use network_id.
* Per-file forbidden settings are handled by the corresponding FileMissing gates.
 */
func FilePresenceAndIntegrity(ctx *context.ValidationContext) error {
	reported := map[string]bool{}
	return context.ForEachRow(ctx, "routes", []string{"network_id"}, func(row *context.ValidationContext) error {
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
