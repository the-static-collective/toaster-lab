declare module "haunted-toaster/generation" {
  export type ValidationError = { path: string; code: string; message: string };
  export type ValidationResult =
    | { ok: false; errors: ValidationError[] }
    | { ok: true; value: unknown; canonicalJson: string; address: string };

  export function validateVisualScore(input: unknown): ValidationResult;
  export function addressVisualScore(score: unknown): string;
  export function resolve(
    analysis: unknown,
    score: unknown,
    constraints: unknown,
    profile: unknown,
  ): unknown;
}
