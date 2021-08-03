declare module "object-path-set" {
    function objectPathSet<T>(obj: T, path: string, value: unknown): T;
    namespace objectPathSet { } // This is a hack to allow ES6 wildcard imports
    export = objectPathSet;
}
