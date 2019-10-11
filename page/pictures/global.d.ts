declare module '*.css' {
  interface CSSClasses {
    [key: string]: string;
  }
  const classes: CSSClasses;
  export = classes;
}

declare type PassiveOptions = { passive: true } | false;

declare const PUBLIC_PATH: string;
