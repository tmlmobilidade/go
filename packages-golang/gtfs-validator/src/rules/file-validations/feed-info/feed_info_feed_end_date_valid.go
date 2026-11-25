package feedinfo

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [feed_info.txt]
  - Field: feed_end_date
  - Presence: Required in GTFS v30
  - Type: Date

# Description

Checks that each supplied feed_end_date is a real calendar date in YYYYMMDD format.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
*/
func (FeedInfoChecks) FeedInfoFeedEndDateValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "feed_info", "feed_end_date")
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "feed_info", "feed_end_date", "The feed_end_date field must be a real calendar date in YYYYMMDD format.", validators.ValidateDate)
}
