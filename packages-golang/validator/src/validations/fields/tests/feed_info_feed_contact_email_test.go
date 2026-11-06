package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestFeedContactEmailField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "feed_info_feed_contact_email_field",
		table: "feed_info",
		field: "feed_contact_email",
		run:   fields.FeedContactEmailField,
	})
}
