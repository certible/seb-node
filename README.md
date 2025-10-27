# @certible/seb-config

A TypeScript library for creating Safe Exam Browser (SEB) configuration files and working with SEB Config Keys.

## Installation

```bash
npm install @certible/seb-config
```

## Usage

### Server-side (Node.js)

Import from the main package for server-side operations:

```typescript
import { writeFileSync } from 'node:fs';
import { generateSEBConfig } from '@certible/seb-config';

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

### Encrypted Configuration

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

### Without Validation

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

## Config Key Generation and Verification

The Config Key feature allows exam systems to verify that SEB clients are using the correct configuration.

### Server-side: Generate Config Key

```typescript
import { generateConfigKey } from '@certible/seb-config';

const config = {
  startURL: 'https://exam.example.com',
  allowQuit: false,
  browserViewMode: 1,
  sendBrowserExamKey: true,
};

// Generate the Config Key (64-char hex string)
const configKey = generateConfigKey(config);
console.log('Config Key:', configKey);
// e.g., "81aad4ab9dfd447cc479e6a4a7c9a544e2cafc7f3adeb68b2a21efad68eca4dc"
```

### Server-side: Verify Config Key from HTTP Headers

When SEB sends requests, it includes the Config Key hash in the `X-SafeExamBrowser-ConfigKeyHash` header:

```typescript
import { verifyConfigKeyHash } from '@certible/seb-config';

app.get('/exam', (req, res) => {
  const configKey = '81aad4ab9dfd447cc479e6a4a7c9a544e2cafc7f3adeb68b2a21efad68eca4dc';
  const requestURL = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const receivedHash = req.headers['x-safeexambrowser-configkeyhash'];

  const isValid = verifyConfigKeyHash(requestURL, configKey, receivedHash);
});
```

### Client-side: Access SEB Keys via JavaScript API

In your web application running inside SEB, import from the `/web` export:

```typescript
import { getSEBKeys, isSEBAvailable } from '@certible/seb-config/web';

const keys = getSEBKeys();

if (keys.isAvailable) {
  console.log('Config Key:', keys.configKey);
  console.log('Browser Exam Key:', keys.browserExamKey);
  console.log('SEB Version:', keys.version);
}
```

## API Reference

### Import Paths

```typescript
// Server-side: Main package
import { generateConfigKey, generateSEBConfig, verifyConfigKeyHash } from '@certible/seb-config';

// Client-side: Web export (smaller bundle, browser-only code)
import { getSEBKeys, isSEBAvailable } from '@certible/seb-config/web';
```

## Resources

- [Safe Exam Browser Developer Documentation](https://safeexambrowser.org/developer/)
- [SEB Config Key Documentation](https://safeexambrowser.org/developer/seb-config-key.html)
- [SEB JavaScript API Demo](http://safeexambrowser.org/exams/bek_ck_new.html)

## License

MPL-2 License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [laravel-seb](https://github.com/ndum/laravel-seb) - Laravel package for SEB integration
- [Safe Exam Browser](https://safeexambrowser.org/) - Official SEB website
