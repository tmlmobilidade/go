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
  - Field: route_url
  - Presence: Optional
  - Type: URL

# Description

Reports a valid route_url that exactly matches the corresponding agency_url.
Matches agency IDs exactly. When a route has no agency ID and the feed has
one agency row, compares against that agency. Skips unresolved or ambiguous
agency references and leaves missing or malformed values to the field checks.

[routes.txt]: https://gtfs.org/documentation/schedule/reference/#routestxt
*/
func (RoutesChecks) RoutesRouteURLDifferentFromAgencyURL(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check that both source tables exist
	for _, table := range []string{"routes", "agency"} {
		exists, err := sqlutils.TableExists(ctx, db, table)
		if err != nil || !exists {
			return err == nil, nil, err
		}
	}

	// 2. Index agency URLs by ID and track the single-agency fallback
	urlsByAgency := make(map[string]string)
	var agencyCount int
	var soleAgencyURL string
	err := sqlutils.ForEachRow(ctx, db, "agency", []string{"agency_id", "agency_url"}, func(_ int, values map[string]string) error {
		id, url := values["agency_id"], values["agency_url"]
		agencyCount++
		if agencyCount == 1 {
			soleAgencyURL = url
		}
		if _, duplicate := urlsByAgency[id]; duplicate {
			url = ""
		}
		urlsByAgency[id] = url
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 3. Compare each route URL with its agency URL
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "routes", []string{"agency_id", "route_url"}, func(row int, values map[string]string) error {
		id, routeURL := values["agency_id"], values["route_url"]
		agencyURL := urlsByAgency[id]
		if strings.TrimSpace(id) == "" {
			agencyURL = ""
			if agencyCount == 1 {
				agencyURL = soleAgencyURL
			}
		}
		if routeURL == agencyURL {
			findings = append(findings, types.Finding{
				Description: "The route URL must differ from the agency URL.",
				Message:     fmt.Sprintf("The route_url value %q matches its agency_url.", routeURL),
				Severity:    config.Severity,
				FileName:    "routes.txt",
				Field:       "route_url",
				Rows:        []int{row},
			})
		}
		return nil
	})

	// 4. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}
