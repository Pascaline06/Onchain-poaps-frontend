"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render-time exceptions anywhere below it — most importantly ones
 * thrown while a wallet connector is mid-handshake (e.g. a WalletConnect
 * relay rejecting a misconfigured project ID). Without this, an error like
 * that can leave the tree in a state where React tears down and rebuilds
 * repeatedly, which is what shows up to a person as "the page flickers,
 * then an error code appears." With this in place, the same failure
 * surfaces once, as a single calm message with a way back — not a loop.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Onchain POAPs — caught render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="stamp mb-4">Something slipped</p>
          <h1 className="font-display text-2xl font-bold">That didn&apos;t load right.</h1>
          <p className="mt-3 text-sm text-ink/70">
            Usually this is a wallet connection hiccup rather than anything wrong with your
            POAPs. Reloading almost always fixes it.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="btn-primary mt-6"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
