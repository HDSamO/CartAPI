import Express from 'express';
import { createUser, getUserByID, updateUser, getAllUsers, getSessionNumber } from '../controllers/usersController.js';
import { startShopping, getCurrentCart, updateCartProduct, endShopping } from '../controllers/cartControllers.js';
import { getPersonalHistory, getHistoryById } from '../controllers/salesController.js';
import jwt from "jsonwebtoken";
const router = Express.Router();

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // console.log(token);
    if (!token) return res.status(401).json({ message: 'Access denied' });
  
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        // console.log(req.user);
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
}

router.get("/sessionNumber", verifyToken, getSessionNumber); //admin required

/**
 * @swagger
 *
 * components:
 *   responses:
 *     Unauthorized:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: A message indicating why the request was unauthorized.
 *                 example: "Missing or invalid authentication token."
 *     InternalServerError:
 *       description: Internal Server Error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: A message indicating what went wrong on the server side.
 *                 example: "An unexpected error occurred while processing the request."
 *     Forbidden:
 *       description: Forbidden
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: A message indicating why the request was forbidden.
 *                 example: "You do not have permission to access this resource."
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags:
 *       - Users
 *     description: Returns a list of all users, but only if the requesting user is an Admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                   description: List of users
 *                   example: {
 *                     "-NX4Mx_plaJtbE2XE08C": {
 *                       "email": "tranhuynhdung03@gmail.com",
 *                       "firstName": "Huynh Dung",
 *                       "lastName": "Tran",
 *                       "password": "$2b$10$zqS31kjqXUQh.sHJK85Glu.KiS7wTkX2dODPzuKaoxsbah19FAlbS",
 *                       "phone": "0799289921",
 *                       "role": "user"
 *                     }
 *                   }
 *                                              
 *       '403':
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '404':
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */

router.get("/", verifyToken, getAllUsers); //admin required

//start shopping
/**
 * @swagger
 *
 * /users/cart/start:
 *   post:
 *     summary: Start shopping
 *     tags:
 *       - Cart
 *     description: Creates a new cart if the session number provided is correct. Requires user authentication.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionNumber:
 *                 type: string
 *                 description: The session number of the user to start shopping.
 *                 example: "123456"
 *         
 *             required:
 *               - sessionNumber
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating whether a new cart was created or not.
 *                   example: "new cart created"
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError' 
 */
router.post("/cart/start", verifyToken, startShopping); 

//see currentCart
/**
 * @swagger
 *
 * /users/cart:
 *   get:
 *     summary: Get current cart
 *     tags:
 *       - Cart
 *     description: Returns the current cart for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentCart:
 *                   $ref: '#/components/schemas/Cart'
 *       '404':
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the current cart is empty.
 *                   example: "Current cart is empty"
 *       '500':
 *         $ref: '#/components/responses/InternalServerError' 
 */
/**
* @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - productID
 *         - productName
 *       properties:
 *         productID:
 *           type: string
 *           description: The unique identifier of the product.
 *         productName:
 *           type: string
 *           description: The name of the product.
 *         productAmount:
 *           type: number
 *           description: The amount of the product (optional).
 *     User: 
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - phone
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         sessionNumber:
 *           type: string
 *         role:
 *           type: string
 *         currentCart:
 *           type: string
 *           description: current shopping cart of the user, no need to pay attention to
 *     Cart:
 *       type: object
 *       properties:
 *         startTime:
 *           type: integer
 *           format: int64
 *           description: The start time of the cart in Unix timestamp format.
 *           example: 1622897709
 *         endTime:
 *           type: integer
 *           format: int64
 *           description: The end time of the cart in Unix timestamp format.
 *           example: 1622897715
 *         totalPrice:
 *           type: number
 *           description: The total price of all products in the cart.
 *           example: 34.99
 *         isPaid:
 *           type: boolean
 *           description: Specifies whether the cart has been paid for or not.
 *           example: false
 *         products:
 *           type: object
 *           additionalProperties:
 *             $ref: '#/components/schemas/Item'
 *           description: A collection of products in the cart.
 */ 
router.get("/cart", verifyToken , getCurrentCart);

//update currentCart
/**
 * @swagger
 *
 * /users/cart:
 *   post:
 *     summary: Update current cart
 *     tags:
 *       - Cart
 *     description: Updates the current cart for the authenticated user with a new product or updates an existing product in the cart.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productID:
 *                 type: string
 *                 description: The ID of the product to be added or updated in the cart.
 *                 example: "product-123"
 *               productAmount:
 *                 type: integer
 *                 description: The amount of the product to be added or updated in the cart.
 *                 example: 2
 *             required:
 *               - productID
 *               - productAmount
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the cart was updated successfully.
 *                   example: "Cart updated successfully"
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: A message indicating that the request body is missing.
 *                   example: "Missing request body"
 *       '404':
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the product ID was not found.
 *                   example: "Product ID not found"
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/cart/", verifyToken, updateCartProduct);

//end shopping
/**
 * @swagger
 *
 * /users/cart/end:
 *   get:
 *     summary: End shopping and generate invoice
 *     tags:
 *       - Cart
 *     description: Ends the current shopping session for the authenticated user, generates a new session number, an invoice based on their current cart, and deletes the cart as well as the old session number.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the shopping session was successfully ended.
 *                   example: "Successfully paid"
 *                 invoiceID:
 *                   type: string
 *                   description: The ID of the generated invoice.
 *                   example: "invoice-123"
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/cart/end", verifyToken, endShopping);

//see history

// router.get("/history/page/:pageNumber", verifyToken , async (req, res) => {
//     const userID = req.user.sub;
//     const pageNumber = parseInt(req.params.pageNumber);
//     try {
//         const historys = await getPersonalHistory(userID ,pageNumber);
//         res.status(200).json(historys);
//     }
//     catch (error) {
//         console.log(error);
//         return res.status(500).send({ message: "Internal server error"})
//     }
// });s

/**
 * @swagger
 *
 * /users/history:
 *   get:
 *     summary: Get personal shopping history
 *     tags:
 *       - Users' History
 *     description: Returns the shopping history of the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: object
 *                   description: A collection of sales records representing the user's shopping history.
 *                   example:
 *                     "sales-123": 
 *                       startTime: 1622897709
 *                       endTime: 1622901000
 *                       isPaid: true
 *                       totalPrice: 250000
 *                       userID: "user-123"
 *                       products:
 *                         "product-123":
 *                           productName: "Product 1"
 *                           productPrice: 50000
 *                           productAmount: 3
 *                         "product-456":
 *                           productName: "Product 2"
 *                           productPrice: 40000
 *                           productAmount: 2
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/history", verifyToken, getPersonalHistory);

/**
 * @swagger
 *
 * /users/history/{id}:
 *   get:
 *     summary: Get shopping history by ID
 *     tags:
 *       - Users' History
 *     description: Returns a specific shopping history record based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the shopping history record to retrieve.
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 salesRecord:
 *                   type: object
 *                   description: A sales record representing the requested shopping history.
 *                   example:
 *                     startTime: 1622897709
 *                     endTime: 1622901000
 *                     isPaid: true
 *                     totalPrice: 250000
 *                     userID: "user-123"
 *                     products:
 *                       "product-123":
 *                         productName: "Product 1"
 *                         productPrice: 50000
 *                         productAmount: 3
 *                       "product-456":
 *                         productName: "Product 2"
 *                         productPrice: 40000
 *                         productAmount: 2
 *       '404':
 *         description: Not Found
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/history/:id",verifyToken , getHistoryById);

//get user by id
/**
 * @swagger
 *
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags:
 *       - Users
 *     description: Returns a specific user based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve.
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: A user object representing the requested user.
 *                   example:
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                     email: "john.doe@example.com"
 *                     phoneNumber: "+1-555-1234"
 *                     address: "123 Main St."
 *                     city: "Anytown"
 *                     state: "CA"
 *                     zipCode: "12345"
 *       '404':
 *         description: Not Found
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', getUserByID); //

//create new user
/**
 * @swagger
 *
 * /users/new:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     description: Creates a new user in the database with the provided information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the user.
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: The last name of the user.
 *                 example: Doe
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 description: The phone number of the user.
 *                 example: 1234567890
 *               password:
 *                 type: string
 *                 description: The password for the user's account.
 *                 example: "password123"
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the new user was added to the database.
 *                   example: "New user added"
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that there was an issue with the request.
 *                   example: "Invalid request body"
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/new', createUser); //

//update user
/**
 * @swagger
 *
 * /users/{id}:
 *   post:
 *     summary: Update a user by ID
 *     tags:
 *       - Users
 *     description: Updates an existing user in the database with the provided information.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The updated first name of the user.
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: The updated last name of the user.
 *                 example: Doe
 *               email:
 *                 type: string
 *                 description: The updated email address of the user.
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 description: The updated phone number of the user.
 *                 example: +1-555-1234
 *               password:
 *                 type: string
 *                 description: The updated password for the user's account.
 *                 example: "newpassword123"
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the user was updated successfully.
 *                   example: "User updated successfully"
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: A message indicating that there was an issue with the request.
 *                   example: "Missing request body"
 *       '404':
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the user was not found.
 *                   example: "User not found"
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/:id", updateUser); //

export default router;

