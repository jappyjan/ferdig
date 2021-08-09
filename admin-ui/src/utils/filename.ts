export function filename(fileOrFullPath: string | File): string {
    let fullPath = fileOrFullPath as string;
    if (typeof fileOrFullPath !== 'string') {
        fullPath = fileOrFullPath.name;
    }

    if (!fullPath) {
        return fullPath;
    }

    const filePathParts = fullPath.split('/');
    return filePathParts[filePathParts.length - 1];
}
