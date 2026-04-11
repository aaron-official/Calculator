export {};

declare global {
  interface Window {
    loadPyodide: any;
    pyodide: any;
  }
}
