package calendar

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: service_id
  - Presence: Required
  - Type: Unique ID

# Description

Unimplemented. Check for duplicate service IDs. This placeholder always passes.

[calendar.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar
*/
func (CalendarChecks) CalendarServiceIDUnique(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}
