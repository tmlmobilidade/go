package types

type Validation struct {
	ID          string
	Description string
	Field       string
	FileName    string
	Severity    *Severity
	Name        string
	SeverityOptions []Severity
}

/*
Creates a new Validation

Parameters:

  - id: unique identifier for the validation 
  - name: display name of the validation
  - description: detailed description of what the validation checks
  - field: the field being validated
  - fileName: the name of the file containing the field
  - severityOptions: list of possible severity levels for this validation

Example:

  CreateValidation(
    "agency.agency_email_validation",
    "Agency Email Validation",
    "Validates if the agency email is present and valid.",
    "agency_email",
    "agency.txt",
    []Severity{SEVERITY_ERROR, SEVERITY_WARNING, SEVERITY_IGNORE}
  )
*/
func CreateValidation(id string, name string, description string, field string, fileName string, severityOptions []Severity) *Validation {
	return &Validation{
		ID: id,
		Description: description,
		Field: field,
		FileName: fileName,
		SeverityOptions: severityOptions,
		Name: name,
	}
}

/*
Returns the severity level of the validation

If no severity is set, it returns SEVERITY_IGNORE as the default value

Returns:
  - Severity: The current severity level of the validation

Example:
  severity := validation.GetSeverity()
*/
func (v *Validation) GetSeverity() Severity {
	if v.Severity == nil {
		return SEVERITY_IGNORE
	}

	return *v.Severity
}

/*
Sets the severity level of the validation.

Parameters:
  - severity: The severity level to set for the validation

Example:
  validation.SetSeverity(types.SEVERITY_ERROR)
*/
func (v *Validation) SetSeverity(severity Severity) {
	v.Severity = &severity
}