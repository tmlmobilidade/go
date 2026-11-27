package routes

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_desc, route_short_name
  - Presence: Optional
  - Type: Text

# Description

Reports routes whose description exactly matches their short name.
The comparison is case-sensitive and preserves whitespace. Missing or blank
descriptions and names are handled by their presence rules.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func (RoutesChecks) RoutesRouteDescDifferentFromRouteShortName(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the routes table exists
	exists, err := sqlutils.TableExists(ctx, db, "routes")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Report descriptions that duplicate the route short name
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "routes", []string{"route_desc", "route_short_name"}, func(row int, values map[string]string) error {
		description := values["route_desc"]
		if strings.TrimSpace(description) != "" && description == values["route_short_name"] {
			findings = append(findings, types.Finding{
				Description:            "The route description must differ from the route short name.",
				DescriptionTranslation: types.NewTranslation("default", nil),
				Message:                fmt.Sprintf("The route_desc value %q duplicates route_short_name.", description),
				MessageTranslation:     types.NewTranslation("default", map[string]any{"value": description}),
				Severity:               config.Severity,
				FileName:               "routes.txt",
				Field:                  "route_desc",
				Rows:                   []int{row},
			})
		}
		return nil
	})

	// 3. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}
