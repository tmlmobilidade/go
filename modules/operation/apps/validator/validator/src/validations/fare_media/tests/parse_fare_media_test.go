package fare_media

import (
	"main/lib"
	"main/services"
	"main/types"
	validations "main/validations/fare_media/validations"
	"testing"
)

func TestParseFareMedia_ValidInput(t *testing.T) {
	services.AppMessageService.Clear()
	row := 1
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "FM1",
		FareMediaName: "Transit Card",
		FareMediaType: "2",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Valid input should not error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	// Verify field values
	if fareMedia.FareMediaId == nil || *fareMedia.FareMediaId != "FM1" {
		t.Errorf("Expected FareMediaId 'FM1', got '%v'", fareMedia.FareMediaId)
	}
	if fareMedia.FareMediaName == nil || *fareMedia.FareMediaName != "Transit Card" {
		t.Errorf("Expected FareMediaName 'Transit Card', got '%v'", fareMedia.FareMediaName)
	}
	if fareMedia.FareMediaType == nil || *fareMedia.FareMediaType != 2 {
		t.Errorf("Expected FareMediaType 2, got '%v'", fareMedia.FareMediaType)
	}
}

func TestParseFareMedia_ValidInput_AllFields(t *testing.T) {
	services.AppMessageService.Clear()
	row := 2
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "FM2",
		FareMediaName: "Mobile App",
		FareMediaType: "4",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Valid input with all fields should not error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	if fareMedia.FareMediaId == nil || *fareMedia.FareMediaId != "FM2" {
		t.Errorf("Expected FareMediaId 'FM2', got '%v'", fareMedia.FareMediaId)
	}
	if fareMedia.FareMediaName == nil || *fareMedia.FareMediaName != "Mobile App" {
		t.Errorf("Expected FareMediaName 'Mobile App', got '%v'", fareMedia.FareMediaName)
	}
	if fareMedia.FareMediaType == nil || *fareMedia.FareMediaType != 4 {
		t.Errorf("Expected FareMediaType 4, got '%v'", fareMedia.FareMediaType)
	}
}

func TestParseFareMedia_EmptyOptionalFields(t *testing.T) {
	services.AppMessageService.Clear()
	row := 3
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "FM3",
		FareMediaName: "",
		FareMediaType: "0",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Empty optional fields should not error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	if fareMedia.FareMediaId == nil || *fareMedia.FareMediaId != "FM3" {
		t.Errorf("Expected FareMediaId 'FM3', got '%v'", fareMedia.FareMediaId)
	}
	// Empty string and nil are equivalent - both mean the field is not set
	if fareMedia.FareMediaName != nil && *fareMedia.FareMediaName != "" {
		t.Errorf("Expected FareMediaName to be nil or empty, got '%v'", fareMedia.FareMediaName)
	}
	if fareMedia.FareMediaType == nil || *fareMedia.FareMediaType != 0 {
		t.Errorf("Expected FareMediaType 0, got '%v'", fareMedia.FareMediaType)
	}
}

func TestParseFareMedia_InvalidFareMediaType(t *testing.T) {
	services.AppMessageService.Clear()
	row := 4
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "FM4",
		FareMediaName: "Test",
		FareMediaType: "not_an_int",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	assertion := lib.AssertionMessage{
		Expected: 1,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Invalid fare_media_type should error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	// Should return empty struct when there are errors
	if fareMedia.FareMediaId != nil {
		t.Errorf("Expected nil FareMediaId when parsing fails, got '%v'", fareMedia.FareMediaId)
	}
}

func TestParseFareMedia_InvalidFareMediaType_NonNumeric(t *testing.T) {
	services.AppMessageService.Clear()
	row := 5
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "FM5",
		FareMediaName: "Test",
		FareMediaType: "abc",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	assertion := lib.AssertionMessage{
		Expected: 1,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Non-numeric fare_media_type should error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	if fareMedia.FareMediaId != nil {
		t.Errorf("Expected nil FareMediaId when parsing fails, got '%v'", fareMedia.FareMediaId)
	}
}

func TestParseFareMedia_ValidFareMediaType_AllValidTypes(t *testing.T) {
	services.AppMessageService.Clear()
	row := 6
	validTypes := []struct {
		input  string
		output int
	}{
		{"0", 0},
		{"1", 1},
		{"2", 2},
		{"3", 3},
		{"4", 4},
	}

	for i, tc := range validTypes {
		services.AppMessageService.Clear()
		rawFareMedia := types.FareMediaRaw{
			FareMediaId:   "FM6",
			FareMediaName: "Test",
			FareMediaType: tc.input,
		}

		fareMedia := validations.ParseFareMedia(rawFareMedia, row+i)

		assertion := lib.AssertionMessage{
			Expected: 0,
			Actual:   services.AppMessageService.GetSummary().TotalErrors,
			Message:  "Valid fare_media_type should not error",
		}
		if assert := lib.Assert(assertion); assert != "" {
			t.Error(assert)
		}

		if fareMedia.FareMediaType == nil || *fareMedia.FareMediaType != tc.output {
			t.Errorf("Expected FareMediaType %d, got '%v'", tc.output, fareMedia.FareMediaType)
		}
	}
}

func TestParseFareMedia_EmptyFareMediaId(t *testing.T) {
	services.AppMessageService.Clear()
	row := 7
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "",
		FareMediaName: "Test",
		FareMediaType: "2",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Empty fare_media_id should not error (optional field)",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	if fareMedia.FareMediaId != nil && *fareMedia.FareMediaId != "" {
		t.Errorf("Expected empty or nil FareMediaId, got '%v'", fareMedia.FareMediaId)
	}
}

func TestParseFareMedia_EmptyFareMediaType(t *testing.T) {
	services.AppMessageService.Clear()
	row := 8
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "FM8",
		FareMediaName: "Test",
		FareMediaType: "",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	// Empty string for int field should cause parse error
	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Empty fare_media_type should not error (will be nil)",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	// FareMediaType should be nil when empty
	if fareMedia.FareMediaType != nil {
		t.Errorf("Expected nil FareMediaType when empty, got '%v'", fareMedia.FareMediaType)
	}
}

func TestParseFareMedia_LongStringValues(t *testing.T) {
	services.AppMessageService.Clear()
	row := 9
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "FM9",
		FareMediaName: "This is a very long fare media name that should still be parsed correctly",
		FareMediaType: "1",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Long string values should not error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	if fareMedia.FareMediaName == nil || *fareMedia.FareMediaName != "This is a very long fare media name that should still be parsed correctly" {
		t.Errorf("Expected long FareMediaName, got '%v'", fareMedia.FareMediaName)
	}
}

func TestParseFareMedia_SpecialCharacters(t *testing.T) {
	services.AppMessageService.Clear()
	row := 10
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "FM-10_Test",
		FareMediaName: "Card & App (2024)",
		FareMediaType: "2",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Special characters in strings should not error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	if fareMedia.FareMediaId == nil || *fareMedia.FareMediaId != "FM-10_Test" {
		t.Errorf("Expected FareMediaId 'FM-10_Test', got '%v'", fareMedia.FareMediaId)
	}
	if fareMedia.FareMediaName == nil || *fareMedia.FareMediaName != "Card & App (2024)" {
		t.Errorf("Expected FareMediaName 'Card & App (2024)', got '%v'", fareMedia.FareMediaName)
	}
}

func TestParseFareMedia_NegativeFareMediaType(t *testing.T) {
	services.AppMessageService.Clear()
	row := 11
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "FM11",
		FareMediaName: "Test",
		FareMediaType: "-1",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	// Negative numbers can be parsed as int, so should not error
	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Negative fare_media_type should parse (validation will catch invalid values)",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	if fareMedia.FareMediaType == nil || *fareMedia.FareMediaType != -1 {
		t.Errorf("Expected FareMediaType -1, got '%v'", fareMedia.FareMediaType)
	}
}

func TestParseFareMedia_LargeFareMediaType(t *testing.T) {
	services.AppMessageService.Clear()
	row := 12
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "FM12",
		FareMediaName: "Test",
		FareMediaType: "999",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	// Large numbers can be parsed as int, so should not error
	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Large fare_media_type should parse (validation will catch invalid values)",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	if fareMedia.FareMediaType == nil || *fareMedia.FareMediaType != 999 {
		t.Errorf("Expected FareMediaType 999, got '%v'", fareMedia.FareMediaType)
	}
}

func TestParseFareMedia_WhitespaceInStrings(t *testing.T) {
	services.AppMessageService.Clear()
	row := 13
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "  FM13  ",
		FareMediaName: "  Transit Card  ",
		FareMediaType: "2",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Whitespace in strings should not error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	// Whitespace should be preserved
	if fareMedia.FareMediaId == nil || *fareMedia.FareMediaId != "  FM13  " {
		t.Errorf("Expected FareMediaId with whitespace '  FM13  ', got '%v'", fareMedia.FareMediaId)
	}
	if fareMedia.FareMediaName == nil || *fareMedia.FareMediaName != "  Transit Card  " {
		t.Errorf("Expected FareMediaName with whitespace '  Transit Card  ', got '%v'", fareMedia.FareMediaName)
	}
}

func TestParseFareMedia_AllFieldsEmpty(t *testing.T) {
	services.AppMessageService.Clear()
	row := 14
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "",
		FareMediaName: "",
		FareMediaType: "",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	// Empty fare_media_type should not cause parse error (empty string for int is handled)
	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "All empty fields should not error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	// All fields should be nil or empty
	if fareMedia.FareMediaId != nil && *fareMedia.FareMediaId != "" {
		t.Errorf("Expected nil or empty FareMediaId, got '%v'", fareMedia.FareMediaId)
	}
	if fareMedia.FareMediaType != nil {
		t.Errorf("Expected nil FareMediaType when empty, got '%v'", fareMedia.FareMediaType)
	}
}

func TestParseFareMedia_MultipleErrors(t *testing.T) {
	services.AppMessageService.Clear()
	row := 15
	rawFareMedia := types.FareMediaRaw{
		FareMediaId:   "FM15",
		FareMediaName: "Test",
		FareMediaType: "invalid",
	}

	fareMedia := validations.ParseFareMedia(rawFareMedia, row)

	// Should have 1 error for invalid fare_media_type
	assertion := lib.AssertionMessage{
		Expected: 1,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Invalid fare_media_type should produce 1 error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}

	// Should return empty struct
	if fareMedia.FareMediaId != nil {
		t.Errorf("Expected nil FareMediaId when parsing fails, got '%v'", fareMedia.FareMediaId)
	}
}
