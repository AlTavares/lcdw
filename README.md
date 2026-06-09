# lcdw

Download LeetCode problem data into a local practice folder.

```text
LeetCode/
  0001_TwoSum/
    README.md
    Solution.swift
```

`README.md` contains the problem statement. `Solution.<ext>` contains the LeetCode starter snippet for the selected language. Swift files also include runnable sample assertions for simple examples.

## Install

Install directly from GitHub:

```bash
bun install --global github:AlTavares/lcdw
```

Or clone and link locally while developing:

```bash
git clone https://github.com/AlTavares/lcdw.git
cd lcdw
bun install
bun link
```

Verify the executable is available:

```bash
lcdw --help
```

## Usage

```bash
lcdw two-sum --language swift
lcdw https://leetcode.com/problems/two-sum/ --language typescript
```

Options:

- `--language`, `-l`: LeetCode language slug
- `--output`, `-o`: output directory, defaults to `LeetCode`
- `--overwrite`: replace existing generated files

## Supported Languages

Algorithm problems:

- `cpp` (C++)
- `java` (Java)
- `python3` (Python3)
- `python` (Python)
- `javascript` (JavaScript)
- `typescript` (TypeScript)
- `csharp` (C#)
- `c` (C)
- `golang` (Go)
- `kotlin` (Kotlin)
- `swift` (Swift)
- `rust` (Rust)
- `ruby` (Ruby)
- `php` (PHP)
- `dart` (Dart)
- `scala` (Scala)
- `elixir` (Elixir)
- `erlang` (Erlang)
- `racket` (Racket)

Database, data, and shell problems:

- `mysql` (MySQL)
- `mssql` (MS SQL Server)
- `postgresql` (PostgreSQL)
- `oraclesql` (Oracle)
- `pythondata` (Pandas)
- `bash` (Bash)

Not every LeetCode problem has snippets for every language. If a problem does not support the requested language, `lcdw` prints the languages available for that problem.

## Development

```bash
bun install
bun test
bunx tsc --noEmit
```
