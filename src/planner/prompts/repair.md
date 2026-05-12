# Repair Prompt

Given a validation or verification report, repair the deck with the smallest useful change.

Repair order:

1. Fix schema errors.
2. Shorten overlong visible text.
3. Move detail into `presenterNotes`.
4. Change slide layout if the content shape is wrong.
5. Edit renderer or theme CSS only when the deck content is already reasonable.

Return the changed files and explain why the repair addresses the report.
