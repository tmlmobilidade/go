package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestFeedEndDateField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "feed_info_feed_end_date_field",
		table: "feed_info",
		field: "feed_end_date",
		run:   fields.FeedEndDateField,
	})
}
