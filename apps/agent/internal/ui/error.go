package ui

type Field struct {
	Label string
	Value string
}

type Hint struct {
	Text    string
	Prefix  string
	Command string
	Suffix  string
}

type Error struct {
	Title   string
	Fields  []Field
	Details []string
	Hints   []Hint
	Cause   error
}

func (e Error) Error() string {
	if e.Cause != nil {
		return e.Cause.Error()
	}
	if e.Title != "" {
		return e.Title
	}
	if len(e.Details) > 0 {
		return e.Details[0]
	}
	return "error"
}
