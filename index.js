import Express from 'express';
import bodyParser from 'body-parser';
import usersRoute from './routes/usersRoute.js';
import authRoute from './routes/authRoute.js';
import productsRoute from './routes/productsRoute.js';
import dotenv from 'dotenv';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
dotenv.config();
const app = Express();
const PORT = process.env.PORT || 5000;

//use json data throughout the application
app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get('/', (req, res) => {
    res.send("Homepage");
});




app.use('/users', usersRoute);

app.use('/auth', authRoute);

app.use('/products', productsRoute);

app.listen(PORT, () => console.log(`Server is now running on Port: ${PORT}`));

