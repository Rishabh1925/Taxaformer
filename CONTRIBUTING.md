# Contributing to Taxaformer

Thank you for your interest in contributing to Taxaformer! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker to report bugs
- Include detailed steps to reproduce the issue
- Provide system information (OS, Node.js version, Python version)
- Include screenshots if applicable

### Suggesting Features
- Open an issue with the "feature request" label
- Describe the feature and its use case
- Explain how it would benefit users
- Consider implementation complexity

### Code Contributions

#### Prerequisites
- Node.js 18+
- Python 3.8+
- Git knowledge
- Familiarity with React, TypeScript, and Python

#### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Taxaformer.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Set up backend: `cd backend && pip install -r requirements.txt`

#### Code Style
- **Frontend**: Follow TypeScript and React best practices
- **Backend**: Follow PEP 8 Python style guide
- **Commits**: Use conventional commit messages
- **Testing**: Add tests for new features

#### Pull Request Process
1. Ensure your code follows the style guidelines
2. Update documentation if needed
3. Add tests for new functionality
4. Ensure all tests pass
5. Create a pull request with a clear description

## 📋 Development Guidelines

### Frontend Development
- Use TypeScript for type safety
- Follow React hooks patterns
- Use Tailwind CSS for styling
- Implement responsive design
- Add proper error handling

### Backend Development
- Use FastAPI best practices
- Implement proper error handling
- Add input validation with Pydantic
- Write comprehensive API documentation
- Follow RESTful API principles

### ML Pipeline Development
- Document model architectures
- Include performance metrics
- Add proper error handling
- Use version control for models
- Implement proper logging

## 🧪 Testing

### Frontend Testing
```bash
npm run test
```

### Backend Testing
```bash
cd backend
python -m pytest
```

### ML Pipeline Testing
```bash
cd ML_backend
python -m pytest
```

## 📚 Documentation

- Update README.md for significant changes
- Add inline code comments
- Update API documentation
- Include examples for new features

## 🏷️ Versioning

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙋‍♀️ Getting Help

- Check existing issues and documentation
- Join our community discussions
- Contact maintainers for complex questions

## 🎯 Priority Areas

We're particularly interested in contributions for:
- Performance optimizations
- New visualization features
- ML model improvements
- Mobile responsiveness
- Accessibility improvements
- Documentation enhancements

Thank you for contributing to Taxaformer! 🧬