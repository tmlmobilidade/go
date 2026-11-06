package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestFeedContactUrlField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "feed_info_feed_contact_url_field",
		table: "feed_info",
		field: "feed_contact_url",
		run:   fields.FeedContactUrlField,
	})
}
