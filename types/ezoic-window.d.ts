export {};

declare global {
  interface Window {
    ezstandalone?: {
      cmd: Array<(this: unknown) => void>;
      showAds?: (...placementIds: number[]) => void;
    };
  }
}
