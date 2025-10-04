// Type declarations for JavaScript modules

declare module './services/consulService.js' {
  const consulService: {
    waitForConsul: (retries: number, delay: number) => Promise<void>;
    registerService: () => Promise<void>;
    setupGracefulShutdown: () => void;
  };
  export default consulService;
}