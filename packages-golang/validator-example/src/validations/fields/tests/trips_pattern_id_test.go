package fields_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/utils/validations"
	fields "github.com/tmlmobilidade/go/packages-golang/validator-example/src/validations/fields/checks"
	"testing"
)

func TestPatternIdField(t *testing.T) {
	testutil.Presence(t, "pattern_id", "trips_pattern_id_field", fields.PatternIdField)
}
