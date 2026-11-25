package feedinfo

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [feed_info.txt]
  - Field: feed_contact_email
  - Presence: Optional
  - Type: Email

# Description

Requires the feed_contact_email column and a nonblank value on each row at error severity.
A missing table is handled by the file presence rule. Forbidden severity rejects supplied values.

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
*/
func (FeedInfoChecks) FeedInfoFeedContactEmailExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "feed_info", "feed_contact_email")
	}

	// 2. Check column and value presence
	return fields.CheckPresence(ctx, db, config, "feed_info", "feed_contact_email", false)
}
