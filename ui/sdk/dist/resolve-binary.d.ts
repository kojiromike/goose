/**
 * Resolves the path to the goose binary.
 *
 * Resolution order:
 *   1. `GOOSE_BINARY` environment variable (explicit override)
 *   2. Platform-specific `@aaif/goose-binary-*` optional dependency
 *
 * @throws if no binary can be found
 */
export declare function resolveGooseBinary(): string;
//# sourceMappingURL=resolve-binary.d.ts.map