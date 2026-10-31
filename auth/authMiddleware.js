const { getAuth } = require('firebase-admin/auth')

const authMiddleware = async (req, res, next) => {

    try {
        // Authentication for the customer account
        // Should be used as a middleware for all customers
        req.language = req.headers['accept-language'] || 'en'
        // To be removed
        req.accountType = req.headers['account-type']

        let idToken;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            // Read the ID Token from the Authorization header.
            idToken = req.headers.authorization.split('Bearer ')[1];
        } else if (req.cookies) {
            // Read the ID Token from cookie.
            idToken = req.cookies.__session;
        }

        const { uid } = await getAuth().verifyIdToken(idToken)

        const currentUser = await getAuth().getUser(uid)
        req.currentUser = currentUser
        req.user = null
        
        next()
    } catch (error) {
        console.error('\nError while verifying Firebase ID token:', { code: error.code, message: error.message }, '\n');
        res.status(403).send({ status: 'Unauthorized', code: error.code, message: error.message });
        // throw error;
    }
}

module.exports = authMiddleware;