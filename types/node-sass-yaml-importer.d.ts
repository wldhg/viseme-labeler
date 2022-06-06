/* eslint-disable @typescript-eslint/no-explicit-any */

type NSYIReturn =
  | {
      contents: string;
    }
  | null
  | Error;

declare module 'node-sass-yaml-importer' {
  export function isValidDataFile(url: string): boolean;
  export function transformJSONtoSass(json: object): string;
  export function parseValue(value: any): string;
  export function parseList(list: any[]): string;
  export function parseMap(map: object): string;
  export default function (url: string, prev: string): NSYIReturn;
}
