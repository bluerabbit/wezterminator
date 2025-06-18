# Wezterminator

WezTerm workspace management tool written in TypeScript for Deno.

## Requirements

- Deno 2.0+
- WezTerm
- zsh

## Installation

```bash
# Clone the repository
git clone https://github.com/bluerabbit/wezterminator.git
cd wezterminator

# Run directly with Deno
deno run --allow-read --allow-write --allow-run --allow-env src/cli.ts [command] [options]

# Or use the executable script
./wezterminator [command] [options]

# Or compile to a standalone binary
deno task compile
./wezterminator [command] [options]
```

## Usage

```bash
# Create a new configuration
./wezterminator new myproject

# Start workspaces defined in configuration
./wezterminator start myproject

# Edit configuration file in editor
./wezterminator edit myproject

# Run a specific workspace
./wezterminator run myproject workspace_name
```

## Configuration

Configuration files are stored in `~/.config/wezterminator/` with `.yml` extension.

Example configuration:

```yaml
root: ~/path/to/project
pre_window: source ~/.zshrc

workspaces:
  - shell:
      panes:
        - npm run dev
        - npm run test:watch
  - editor: nvim
  - server:
      root: ~/another/path
      panes:
        - npm start
        - tail -f logs/app.log
```

## Debug Mode

Enable debug mode to see all executed commands:

```bash
# Using environment variable
WEZTERMINATOR_DEBUG=1 ./wezterminator start myproject

# Using command line flag
./wezterminator start myproject --debug
```

## Binary Compilation

Compile to a standalone binary that doesn't require Deno to be installed:

```bash
# Compile for current platform (recommended)
deno task compile

# Platform-specific compilation (easy way)
deno task compile:mac          # macOS Apple Silicon
deno task compile:mac-intel    # macOS Intel
deno task compile:linux        # Linux x86_64
deno task compile:windows      # Windows x86_64
deno task compile:all          # All platforms

# Manual compilation with custom output name
deno compile --allow-read --allow-write --allow-run --allow-env --output=wezterminator-custom src/cli.ts
```

### Binary Features
- **Self-contained**: No Deno installation required
- **Size**: ~65MB (includes Deno runtime + dependencies)
- **Platform**: Native binaries for each target platform
- **Performance**: Fast startup, no interpretation overhead

### Installing Binary Globally

```bash
# After compilation
sudo mv wezterminator /usr/local/bin/
# Now you can use 'wezterminator' from anywhere
wezterminator new myproject
```

## Development

```bash
# Run tests
deno task test

# Check types
deno task check

# Format code
deno task fmt

# Lint code
deno task lint

# Compile to binary
deno task compile

# Platform-specific compilation
deno task compile:mac          # macOS Apple Silicon
deno task compile:mac-intel    # macOS Intel
deno task compile:linux        # Linux x86_64
deno task compile:windows      # Windows x86_64
deno task compile:all          # All platforms
```

## Continuous Integration

This project uses GitHub Actions for automated testing and building:

### CI Pipeline
- **Testing**: Runs on Ubuntu with Deno 2.x and 2.3.x
- **Type Checking**: Validates TypeScript compilation
- **Linting**: Ensures code quality with `deno lint`
- **Formatting**: Validates code formatting with `deno fmt`
- **Cross-platform Building**: Creates binaries for Linux, macOS, and Windows

### Build Artifacts
On pushes to the `deno` branch, GitHub Actions automatically builds binaries for:
- Linux (x86_64)
- macOS Intel (x86_64)
- macOS Apple Silicon (ARM64)
- Windows (x86_64)

### Releases
When a version tag (e.g., `v1.0.0`) is pushed, the release workflow:
1. Creates a GitHub release
2. Builds binaries for all supported platforms
3. Uploads binaries as release assets

To create a release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Architecture

Wezterminator follows a modular architecture:

- **CLI**: Main entry point that parses arguments and orchestrates workspace operations
- **Configuration**: Handles loading and validation of YAML configuration files
- **Workspace**: Core workspace management, creates windows and coordinates pane creation
- **PaneManager**: Manages individual panes within workspaces
- **WeztermCLI**: Wrapper for WezTerm CLI commands
- **CommandExecutor**: Centralized command execution with error handling
- **Debug**: Debug logging functionality

## Features

- Written in TypeScript for Deno runtime
- Uses Deno's built-in permissions system
- Async/await patterns throughout
- Native TypeScript type safety
- Uses Deno standard library for YAML parsing and file operations
- Can be compiled to a standalone binary
- Cross-platform support (macOS, Linux, Windows)

## License

MIT