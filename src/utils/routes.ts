// All public and protected routes are defined here...!

const publicRoutes: string[] = [
    '/login',
    '/signup'
];

const privateRoutes: string[] = [
    '/home',
    '/about',
    '/users',
    '/users/roles',
    '/users/profile',
    '/users/activity'
];

export {
    publicRoutes,
    privateRoutes
};