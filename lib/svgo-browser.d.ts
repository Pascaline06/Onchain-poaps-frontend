declare module "svgo/dist/svgo.browser.js" {
  export interface OptimizeOptions {
    multipass?: boolean;
    plugins?: Array<
      | string
      | {
          name: string;
          params?: Record<string, unknown>;
        }
    >;
  }

  export interface OptimizedSvg {
    data: string;
  }

  export function optimize(
    input: string,
    options?: OptimizeOptions
  ): OptimizedSvg | { error: string };
}
