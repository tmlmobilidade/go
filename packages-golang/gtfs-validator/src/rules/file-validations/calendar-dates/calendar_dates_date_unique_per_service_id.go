package calendardates

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

/*
# Attributes

  - File: [calendar_dates.txt]
  - Field: service_id, date
  - Presence: Required
  - Type: ID and date

# Description

Unimplemented. Check for duplicate exception dates within each service ID. This placeholder always passes.

[calendar_dates.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar-dates
*/
func (CalendarDatesChecks) CalendarDatesDateUniquePerServiceID(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Pass until this validation is implemented
	return true, nil, nil
}
