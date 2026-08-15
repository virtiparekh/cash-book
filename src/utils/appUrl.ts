export const BASE_PATH = "/cash-book";

export function appPath(path: string = ""): string {
    if (!path) {
        return BASE_PATH;
    }

    // Already contains the application base path
    if (
        path === BASE_PATH ||
        path.startsWith(`${BASE_PATH}/`)
    ) {
        return path;
    }

    // Normal application route
    return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}