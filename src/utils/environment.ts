/**
 * Detects if the application is running in development environment
 * @returns boolean indicating if we're in dev mode
 */
export const isDevelopment = (): boolean => {
    // Check for VITE environment variables (Vite default)
    if (import.meta.env?.MODE === 'development') {
        return true;
    }
    if (import.meta.env?.MODE === 'test') {
        return false;
    }

    // Check for process.env.NODE_ENV (Node.js style)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (process?.env?.NODE_ENV === 'development') {
        return true;
    }

    // Fallback: check if running in browser and URL contains localhost or 127.0.0.1
    if (typeof window !== 'undefined' && window.location) {
        const {hostname} = window.location;
        return hostname === 'localhost' || hostname === '127.0.0.1';
    }

    return false;
};