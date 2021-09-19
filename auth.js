export const isAuth = (req, res, next) => {
    if (req.session.user) {
        //if user exists on session
        next();
    } else {
        // else redirect to login
        res.redirect('/login');
    }
}