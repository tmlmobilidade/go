package i18n

import (
	"go/ast"
	"go/parser"
	"go/token"
	"io/fs"
	"path/filepath"
	"strconv"
	"strings"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

func TestGenericMessagesDescribeFindings(t *testing.T) {
	for _, language := range []string{"en", "pt", "es"} {
		translator := NewTranslator(language)
		for key, message := range translator.translations {
			if !strings.HasSuffix(key, ".generic") {
				continue
			}
			t.Run(language+"/"+key, func(t *testing.T) {
				for _, description := range []string{"Checks ", "Reports ", "Compares ", "Verifica ", "Assinala ", "Compara ", "Comprueba ", "Verifica si ", "Informa "} {
					if strings.HasPrefix(message, description) {
						t.Errorf("generic message describes a check instead of a finding: %q", message)
					}
				}
				if strings.Contains(message, "%") {
					t.Errorf("generic message requires formatting arguments: %q", message)
				}
			})
		}
	}
}

// File-presence keys are assembled dynamically and cannot be discovered by
// the literal call-site checks below.
func TestMissingFileTranslations(t *testing.T) {
	for _, language := range []string{"en", "pt", "es"} {
		translator := NewTranslator(language)
		for _, table := range variables.GtfsRuleFiles {
			t.Run(language+"/"+table, func(t *testing.T) {
				message := translator.Get("file_missing.message", table+".txt")
				if message == "file_missing.message" || !strings.Contains(message, table+".txt") || strings.Contains(message, "%!") {
					t.Fatalf("invalid missing-file message: %q", message)
				}
			})
		}
	}
}

// Check the actual call sites, including contexts for several rules in one file.
func TestValidationDetailTranslationsUseRuleIDs(t *testing.T) {
	// Resolve each imported callback to the rule ID in the central registry.
	registrations, err := parser.ParseFile(token.NewFileSet(), "../validations/registry-rules.go", nil, 0)
	if err != nil {
		t.Fatal(err)
	}
	packages := map[string]string{}
	for _, spec := range registrations.Imports {
		importPath, err := strconv.Unquote(spec.Path.Value)
		if err != nil {
			t.Fatal(err)
		}
		directory, local := strings.CutPrefix(importPath, "github.com/tmlmobilidade/go/packages-golang/validator/src/")
		if !local {
			continue
		}
		alias := filepath.Base(directory)
		if spec.Name != nil {
			alias = spec.Name.Name
		}
		packages[alias] = filepath.Join("..", filepath.FromSlash(directory))
	}
	functionRules := map[string]string{}
	ast.Inspect(registrations, func(node ast.Node) bool {
		batch, ok := node.(*ast.CompositeLit)
		if !ok {
			return true
		}
		selector, ok := batch.Type.(*ast.SelectorExpr)
		if !ok || selector.Sel.Name != "RuleChecks" {
			return true
		}
		for _, element := range batch.Elts {
			pair, ok := element.(*ast.KeyValueExpr)
			if !ok {
				t.Fatal("registration must map a rule ID to a validation function")
			}
			id, validID := resolveString(pair.Key)
			function, validFunction := pair.Value.(*ast.SelectorExpr)
			if !validID || !validFunction {
				t.Fatal("registration must identify a rule ID and imported validation function")
			}
			alias, ok := function.X.(*ast.Ident)
			if !ok || packages[alias.Name] == "" {
				t.Fatalf("cannot resolve validation package for %s", id)
			}
			functionRules[filepath.Join(packages[alias.Name], function.Sel.Name)] = id
		}
		return true
	})
	if len(functionRules) == 0 {
		t.Fatal("no registered validations found")
	}

	translators := []*Translator{NewTranslator("en"), NewTranslator("es"), NewTranslator("pt")}
	check := func(key string, position token.Position) {
		for _, translator := range translators {
			if _, exists := translator.translations[key]; !exists {
				t.Errorf("%s: missing %s translation %s", position, translator.language, key)
			}
		}
	}
	for _, id := range functionRules {
		check(id+".generic", token.Position{Filename: "../validations/registry-rules.go"})
	}
	err = filepath.WalkDir("..", func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() || !strings.HasSuffix(path, ".go") || strings.HasSuffix(path, "_test.go") {
			return nil
		}
		positions := token.NewFileSet()
		file, err := parser.ParseFile(positions, path, nil, 0)
		if err != nil {
			return err
		}
		ruleForPosition := func(position token.Pos) (string, bool) {
			for _, declaration := range file.Decls {
				if function, ok := declaration.(*ast.FuncDecl); ok && function.Body != nil && position >= function.Body.Pos() && position <= function.Body.End() {
					id, exists := functionRules[filepath.Join(filepath.Dir(path), function.Name.Name)]
					return id, exists
				}
			}
			return "", false
		}
		ast.Inspect(file, func(node ast.Node) bool {
			call, ok := node.(*ast.CallExpr)
			if !ok {
				return true
			}
			method, ok := call.Fun.(*ast.SelectorExpr)
			if !ok {
				return true
			}
			if method.Sel.Name == "Get" {
				if receiver, ok := method.X.(*ast.SelectorExpr); ok && receiver.Sel.Name == "AppTranslator" {
					if key, ok := call.Args[0].(*ast.BasicLit); ok {
						value, _ := strconv.Unquote(key.Value)
						// Primitive conversion errors are shared parser helpers, not rules.
						if !strings.HasPrefix(value, "parser.") {
							check(value, positions.Position(key.Pos()))
						}
					}
				}
				return true
			}
			if method.Sel.Name != "GetTranslatedMessage" && method.Sel.Name != "GetRequiredMessage" && method.Sel.Name != "GetSeverityMessage" {
				return true
			}
			// Resolve rule-specific detail keys inside registered validations.
			if !strings.HasPrefix(filepath.ToSlash(path), "../validations/") {
				return true
			}
			// Audit callbacks that can execute. Registration completeness is checked
			// separately in validations tests, including all standard checks.
			ruleID, ok := ruleForPosition(call.Pos())
			if !ok {
				return true
			}
			if len(call.Args) == 0 {
				t.Errorf("%s: missing validation context", positions.Position(call.Pos()))
				return true
			}
			count := 1
			if method.Sel.Name == "GetRequiredMessage" {
				count = 2
			}
			if method.Sel.Name == "GetSeverityMessage" {
				count = 3
			}
			if len(call.Args) < count+1 {
				t.Errorf("%s: missing detail keys", positions.Position(call.Pos()))
				return true
			}
			for _, argument := range call.Args[1 : count+1] {
				key, ok := argument.(*ast.BasicLit)
				if !ok {
					t.Errorf("%s: expected a literal detail key", positions.Position(argument.Pos()))
					continue
				}
				value, _ := strconv.Unquote(key.Value)
				if strings.Contains(value, ".") {
					t.Errorf("%s: use a detail key without a rule prefix: %s", positions.Position(key.Pos()), value)
				}
				check(ruleID+"."+value, positions.Position(key.Pos()))
				for _, translator := range translators {
					template, exists := translator.translations[ruleID+"."+value]
					if !exists {
						continue
					}
					arguments := len(call.Args) - count - 1
					placeholders := strings.Count(strings.ReplaceAll(template, "%%", ""), "%")
					if placeholders != arguments {
						t.Errorf("%s: %s translation %s.%s expects %d formatting arguments, call supplies %d", positions.Position(key.Pos()), translator.language, ruleID, value, placeholders, arguments)
					}
				}
			}
			return true
		})
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

// resolveString follows the declaration attached by the parser, so local ruleID
// constants remain scoped to their function rather than a file-wide name map.
func resolveString(expr ast.Expr) (string, bool) {
	return resolveStringSeen(expr, make(map[ast.Expr]bool))
}
func resolveStringSeen(expr ast.Expr, seen map[ast.Expr]bool) (string, bool) {
	if expr == nil || seen[expr] {
		return "", false
	}
	seen[expr] = true
	switch value := expr.(type) {
	case *ast.BasicLit:
		if value.Kind != token.STRING {
			return "", false
		}
		result, err := strconv.Unquote(value.Value)
		return result, err == nil
	case *ast.ParenExpr:
		return resolveStringSeen(value.X, seen)
	case *ast.Ident:
		if value.Obj == nil {
			return "", false
		}
		if declaration, ok := value.Obj.Decl.(*ast.ValueSpec); ok {
			for i, name := range declaration.Names {
				if name.Name == value.Name && i < len(declaration.Values) {
					return resolveStringSeen(declaration.Values[i], seen)
				}
			}
		}
	}
	return "", false
}

func TestResolveStringRuleIDs(t *testing.T) {
	source := `package example
const packageRule = "package_rule"
func first() {
 const ruleID = "first_rule"
 const alias = ruleID
 use("literal_rule")
 use(ruleID)
 use((alias))
 use(packageRule)
}
func second() {
 const ruleID = "second_rule"
 use(ruleID)
 use(unknown)
 use(42)
}
`
	file, err := parser.ParseFile(token.NewFileSet(), "fixture.go", source, 0)
	if err != nil {
		t.Fatal(err)
	}
	expected := []struct {
		value string
		ok    bool
	}{
		{"literal_rule", true}, {"first_rule", true}, {"first_rule", true},
		{"package_rule", true}, {"second_rule", true}, {"", false}, {"", false},
	}
	index := 0
	ast.Inspect(file, func(node ast.Node) bool {
		call, ok := node.(*ast.CallExpr)
		if !ok {
			return true
		}
		if index >= len(expected) {
			t.Fatal("unexpected call")
		}
		value, resolved := resolveString(call.Args[0])
		if value != expected[index].value || resolved != expected[index].ok {
			t.Errorf("call %d: got (%q,%v), want %+v", index, value, resolved, expected[index])
		}
		index++
		return true
	})
	if index != len(expected) {
		t.Fatalf("checked %d calls, want %d", index, len(expected))
	}
}
