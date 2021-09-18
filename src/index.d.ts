export function on(path: String, callback: Function): Boolean;
export function one(path: String, callback: Function): Boolean;
export function off(path: String, includeChildren: Boolean): Boolean;
export function find(path: String, includeChildren: Boolean): String[];
export function trigger(path: String, ...args: any[]): Boolean;
export function replace(path: String, callback: Function): Boolean;
export const names: String[]
export const ordered: String[]
