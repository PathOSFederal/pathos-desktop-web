export interface NavigationAdapter {
  currentPath: string;
  navigate(path: string): void;
}
