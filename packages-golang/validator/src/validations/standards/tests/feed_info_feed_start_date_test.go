package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestFeedInfoFeedStartDate(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "feed_info_feed_start_date_field",
		table: "feed_info",
		field: "feed_start_date",
		run:   standard.FeedStartDateField,
	})
}
