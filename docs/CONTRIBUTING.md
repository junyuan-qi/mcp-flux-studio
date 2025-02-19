# Contributing to Flux MCP Server

We love your input! We want to make contributing to Flux MCP Server as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable.
2. Update the docs/ with any new documentation.
3. The PR will be merged once you have the sign-off of at least one other developer.

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](https://github.com/yourusername/flux-mcp-server/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/flux-mcp-server/issues/new).

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Code Style

We use ESLint and Prettier to maintain code style and best practices. Please:

- Run `npm run lint` before committing to ensure your changes follow our coding standards
- Run `npm run format` to automatically format your code

Our style guide includes:

- 2 spaces for indentation
- 80 character line length
- Use ES6+ features when appropriate
- Prefer const over let
- Use meaningful variable names
- Add comments for complex logic

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing tests or correcting existing tests
- chore: Changes to the build process or auxiliary tools

Example:
```
feat(tools): add new image generation tool

Add a new tool for generating images with custom parameters.
Includes tests and documentation.

Closes #123
```

## Testing

We use Jest for testing. Please write tests for new code you create:

```typescript
describe('FluxAPI', () => {
  it('should generate an image', async () => {
    // Your test code here
  });
});
```

Run the test suite with:

```bash
npm test
```

## Documentation

- Use JSDoc comments for functions and classes
- Update API.md when adding or modifying tools
- Keep README.md up to date
- Add examples for new features

## Setting up your development environment

1. Install Node.js (v16 or later)
2. Clone the repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up pre-commit hooks:
   ```bash
   npm run prepare
   ```
5. Create a .env file with your development settings

## Community

- Be welcoming to newcomers and encourage diverse new contributors
- Be respectful of different viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Questions?

Don't hesitate to ask questions in our [GitHub Discussions](https://github.com/yourusername/flux-mcp-server/discussions) section.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
