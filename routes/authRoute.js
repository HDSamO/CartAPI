import Express from 'express';
// import { createUser, getUser, userLogin } from '../controllers/usersController.js';
import { login } from '../controllers/authController.js';
const router = Express.Router();



//tutor
router.get('/', (req, res) => {
    res.send("AUTH ROUTE");
});

//login
/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Login user with email or phone and password
 *     tags:
 *       - Authentication
 *     description: Checks if the provided email and password combination is valid and returns an access token on success.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 description: User's password.
 *             required:
 *               - email (or phone)
 *               - password
 *     responses:
 *       '200':
 *         description: Access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JSON web token to be used to authenticate requests.
 *       '400':
 *         description: Invalid request parameters
 *       '404':
 *         description: User not found
 * 
 */
router.post('/', login);


export default router;
