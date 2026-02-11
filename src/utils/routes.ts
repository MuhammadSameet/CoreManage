// All public and protected routes are defined here...!

const publicRoutes: string[] = [
    '/login',
    '/signup',
    '/forgot-password',
    // '/404'
];

const privateRoutes: string[] = [
    '/',
    '/about',
    '/users',
    '/users/roles',
    '/users/profile',
    '/users/activity',
    '/users/search',
    '/users/detail',
    '/users/collections',
    '/users/report',
    '/users/uploadentry',
    '/settings'
];

// Routes that are BLOCKED for ALL roles (admin, employee, user) - redirect to 404
const blockedRoutes: string[] = [
    // '/',
    '/payments',
    '/attendance',
    '/leave-management',
    '/employees',
    '/home'
];

export {
    publicRoutes,
    privateRoutes,
    blockedRoutes
};