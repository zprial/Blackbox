// declare function require(path: string): string
declare interface GridViewOptions {
  // The grid's frames
  frames?: number;
  // The grid's cover
  cover?: string;
  // The grid's size
  size?: string;
  // Will trigger when succeed
  onSuccess?: () => any
}
