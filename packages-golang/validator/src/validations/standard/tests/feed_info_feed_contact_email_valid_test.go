package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestFeedContactEmailValid(t *testing.T) {
	const id = "feed_info_feed_contact_email_valid"
	for _, tc := range []struct {
		name  string
		value any
		count int
	}{{"Address", "feeds@example.org", 0},
		{"PlusAddress", "feeds+test@example.org", 0},
		{"Trimmed", " feeds@example.org ", 0},
		{"MissingAt", "example.org", 1},
		{"MissingDomain", "feeds@", 1},
		{"Empty", "", 1},
		{"Null", nil, 1},
		{"MissingColumn", nil, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]any{"feed_contact_email": tc.value}
			if tc.name == "MissingColumn" {
				delete(values, "feed_contact_email")
			}
			config := validationutils.FeedInfoConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.FeedInfoFixture(t, values, config)
			if err := standard.FeedContactEmailValid(ctx, config.Rule("feed_info_feed_contact_email_valid")); err != nil {
				t.Fatal(err)
			}
			validationutils.FeedInfoAssertFindings(t, id, "feed_contact_email", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.FeedInfoCheckInvalid(t, id, "feed_contact_email", standard.FeedContactEmailValid, map[string]any{"feed_contact_email": "invalid-email"})
}
