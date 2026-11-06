package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/utils"
	"testing"
)

func TestPatternIdField(t *testing.T) {
	testutil.Presence(t, "pattern_id", "trips_pattern_id_field", fields.PatternIdField)
}
