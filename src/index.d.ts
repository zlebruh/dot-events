function VALID(path: String): Boolean;
function NAMES(): String[];
function ORDERED(): String[];
function CLEANER(path: String): String;
function PULL_TRIGGER(key: String, args: any[]): Boolean;
function ADD_EVENT(path: String, callback: Function): Boolean;
function REMOVE_EVENT(path): Boolean;
function REMOVE_EVENTS(list): Boolean;

export function on(path: String, callback: Function): Boolean;
export function one(path: String, callback: Function): Boolean;
export function off(path: String, includeChildren: Boolean): Boolean;
export function has(path: String): Boolean;
export function find(path: String, includeChildren: Boolean): String[];
export function trigger(path: String, ...args: any[]): Boolean;
export function replace(path: String, callback: Function): Boolean;
export const names: String[]
export const ordered: String[]
