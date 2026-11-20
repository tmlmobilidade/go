package routes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: agency_id
  - Presence: Conditionally required
  - Type: Foreign ID referencing agency.agency_id

# Description

Checks each supplied agency_id against agency.agency_id.
Missing or blank source values are handled by the presence rule.

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
*/
func (RoutesChecks) RoutesAgencyIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check each supplied ID against the referenced column
	return fields.CheckForeignKey(ctx, db, config, "routes", "agency_id", "agency", "agency_id")
}
