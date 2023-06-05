import Express from 'express';
import { addProduct, getProductByID, getProducts, updateProduct, deleteProductByID } from '../controllers/productsController.js';
import jwt from "jsonwebtoken";
const router = Express.Router();


function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
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


//tutor
router.get('/', (req, res) => {
    res.send("PRODUCTS ROUTE");
});

/**
 * @swagger
 *
 * /products/add:
 *   post:
 *     summary: Add a new product
 *     tags:
 *       - Products
 *     description: Adds a new product to the application's database. Only users with "admin" role are authorized to access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
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
 *                   description: A message indicating that the product was added successfully.
 *                   example: "product added"
 *                 productID:
 *                   type: string
 *                   description: The ID of the newly created product in the database.
 *                   example: "-M9by1Xn1fWtNQNU26Ux"
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
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that admin privileges are required to perform this action.
 *                   example: "Admin required"
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     UnauthorizedError:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: A message indicating that authentication is required to perform this action.
 *                 example: "Unauthorized"
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
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         productName:
 *           type: string
 *           description: The name of the product.
 *           example: "iPhone 13"
 *         unitPrice:
 *           type: number
 *           description: The price of the product per unit.
 *           example: 999.99
 *         description:
 *           type: string
 *           description: An optional description of the product.
 *           example: "A powerful smartphone with a stunning display."
 *         image:
 *           type: string(uri)
 *           description: A required link to the image of the product
 *           example: "https://en.wikipedia.org/wiki/Instant_noodles#/media/File:Mama_instant_noodle_block.jpg"
 *         code:
 *           type: string
 *           description: Required code of the product
 *         discount:
 *           type: number
 *           description: An optional discount percentage for the product.
 *           example: 10
 *         storage:
 *           type: number
 *           description: Amount of product available in storage.
 *           example: 128
 *       required:
 *         - productName
 *         - unitPrice
 *         - image
 *         - code
 */

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
 
router.post("/add", verifyToken, addProduct); //admin required

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Retrieve a product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the product to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       '404':
 *         description: Product not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       '500':
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get("/:id", getProductByID)

/**
 * @swagger
 * /products/{id}:
 *   post:
 *     summary: Update a product by ID.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to update.
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         description: The update information for the product.
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ProductUpdate'
 *     responses:
 *       '200':
 *         description: Product updated successfully.
 *         schema:
 *           $ref: '#/definitions/SuccessResponse'
 *       '400':
 *         description: Missing request body.
 *         schema:
 *           $ref: '#/definitions/BadRequestResponse'
 *       '403':
 *         description: Admin required.
 *         schema:
 *           $ref: '#/definitions/ForbiddenResponse'
 *       '404':
 *         description: Product not found.
 *         schema:
 *           $ref: '#/definitions/NotFoundResponse'
 *       '500':
 *         description: Internal server error.
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */

/**
 * @swagger
 * definitions:
 *   ProductUpdate:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *         description: The name of the product.
 *       price:
 *         type: number
 *         description: The price of the product.
 *       description:
 *         type: string
 *         description: The description of the product.
 *   SuccessResponse:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *   BadRequestResponse:
 *     type: object
 *     properties:
 *       error:
 *         type: string
 *   ForbiddenResponse:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *   NotFoundResponse:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *   ErrorResponse:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 */
router.post("/:id", verifyToken , updateProduct) //admin required

/**
 * @swagger
 * /products/delete/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags:
 *       - Products
 *     description: Deletes a product from the database using its ID. Admin role required.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the product to delete
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '204':
 *         description: Product successfully deleted
 *       '403':
 *         description: Admin role required
 *       '500':
 *         description: Internal server error
 *
 * securitySchemes:
 *   BearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 */
router.delete("/:id", verifyToken, deleteProductByID); //admin required

/**
 * @swagger
 * /products/page/{pageNumber}:
 *   get:
 *     summary: Get a page of products
 *     tags:
 *       - Products
 *     description: Retrieves a paginated list of products from the database.
 *     parameters:
 *       - in: path
 *         name: pageNumber
 *         description: Page number to retrieve
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Paginated list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                   description: The current page number
 *                 totalPage:
 *                   type: integer
 *                   description: The total number of pages available
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       '500':
 *         description: Internal server error
 * 
 */

router.get("/page/:pageNumber", async (req, res) => {
    const pageNumber = parseInt(req.params.pageNumber);
    try {
        const products = await getProducts(pageNumber);
        res.status(200).json(products);
    }
    catch (error) {
        return res.status(500).send({ message: "Internal server error"})
    }
})

export default router;
