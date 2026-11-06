package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestFeedStartDateField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "feed_info_feed_start_date_field",
		table: "feed_info",
		field: "feed_start_date",
		run:   fields.FeedStartDateField,
	})
}
