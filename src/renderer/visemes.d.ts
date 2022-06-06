/* eslint-disable @typescript-eslint/no-explicit-any */
type Viseme = {
  readonly id_begin: {
    readonly ja: number;
    readonly mo: number;
  };
  readonly empty_str: string;
  readonly ja: string[];
  readonly mo: string[];
};

declare module '*.yml' {
  const content: Viseme | any;
  export default content;
}
