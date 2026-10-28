package pathways_fields_test

import (
	checks "main/validations/pathways/fields/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestSignpostedAsField(t *testing.T) {
	testutils.CheckPresence(t, "signposted_as", checks.SignpostedAsField)
}
