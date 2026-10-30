package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestFeedContactUrlField(t *testing.T) {
	validationutils.FeedInfoCheckPresence(t, "feed_contact_url", fields.FeedContactUrlField)
}
