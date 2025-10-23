# @certible/seb-config

A TypeScript/Node.js library for creating Safe Exam Browser (SEB) configuration files.

## Installation

```bash
npm install @certible/seb-config
```

## Quick Start

```typescript
import { generateSEBConfig } from '@certible/seb-config';
import { writeFileSync } from 'fs';

// Create a basic SEB configuration
const result = await generateSEBConfig({
  startURL: 'https://exam.example.com',
  allowQuit: false,
  browserViewMode: 1, // Fullscreen
  enableURLFilter: true,
  urlFilterRules: [
    {
      active: true,
      expression: 'example.com',
      action: 1, // Allow
    },
  ],
});

// Save to file
writeFileSync('exam.seb', result.data);
console.log(`Created SEB file (${result.size} bytes)`);
```

## Encrypted Configuration

Create a password-protected SEB file:

```typescript
const result = await generateSEBConfig(
  {
    startURL: 'https://exam.example.com',
    allowQuit: false,
  },
  {
    encrypt: true,
    password: 'your-secure-password',
  }
);
```

## Without Validation

Skip schema validation for custom configurations:

```typescript
const result = await generateSEBConfig(
  {
    startURL: 'https://exam.example.com',
    customField: 'custom-value', // Not in schema
  },
  {
    validate: false,
  }
);
```

## Resources

- [Safe Exam Browser Developer Documentation](https://safeexambrowser.org/developer/)

## License

MPL-2 License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [laravel-seb](https://github.com/ndum/laravel-seb) - Laravel package for SEB integration
- [Safe Exam Browser](https://safeexambrowser.org/) - Official SEB website
