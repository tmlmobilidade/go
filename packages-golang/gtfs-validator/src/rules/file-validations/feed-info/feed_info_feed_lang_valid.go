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
  - Field: feed_lang
  - Presence: Optional
  - Type: Language code

# Description

Checks that each supplied feed_lang is a valid BCP 47 language tag.
Missing or blank values are handled by the presence rule. Forbidden severity rejects supplied values.

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
*/
func (FeedInfoChecks) FeedInfoFeedLangValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Reject supplied values when the field is forbidden
	if config.Severity == types.SEVERITY_FORBIDDEN {
		return fields.CheckForbiddenValues(ctx, db, config, "feed_info", "feed_lang")
	}

	// 2. Check the format of supplied values
	return fields.CheckValues(ctx, db, config, "feed_info", "feed_lang", "The feed_lang field must be a valid BCP 47 language tag.", validators.ValidateLanguage)
}
