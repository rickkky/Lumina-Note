export interface DirtyWindowCloseEvent {
  preventDefault(): void;
}

export interface DirtyWindowCloseOptions {
  getDirtyFileCount(): number;
  showDiscardDialog(count: number): number;
  clearDirtyFileCount(): void;
  forceClose(): void;
}

export function handleDirtyWindowClose(
  event: DirtyWindowCloseEvent,
  options: DirtyWindowCloseOptions,
): void {
  const dirtyFileCount = options.getDirtyFileCount();
  if (dirtyFileCount <= 0) return;

  event.preventDefault();

  const choice = options.showDiscardDialog(dirtyFileCount);
  if (choice !== 1) return;

  options.clearDirtyFileCount();
  options.forceClose();
}
