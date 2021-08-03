declare module "object-resolve-path" {
    function objectResolvePath<InputType, ExpectedOutputType>(o: InputType, path: string): ExpectedOutputType | undefined;
    namespace objectResolvePath { } // This is a hack to allow ES6 wildcard imports
    export = objectResolvePath;
}
