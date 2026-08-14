export const BASE_PATH = "/cash-book";

export function appPath(path: string = ""): string {
    if (!path) {
        return BASE_PATH;
    }

    return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}