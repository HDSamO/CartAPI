import Joi from 'joi';

// Item schema
export const itemSchema = Joi.object({
    productID: Joi.string().required(),
    productName: Joi.string().required(),
    productAmount: Joi.number().optional()
});

// Current cart schema
export const currentCartSchema = Joi.object({
    startTime: Joi.date().timestamp('javascript').optional(),
    endTime: Joi.date().timestamp('javascript').optional(),
    totalPrice: Joi.number().optional(),
    isPaid: Joi.boolean().optional(), 
    products: Joi.object().pattern(
      Joi.string(), itemSchema
    ).optional()
  });

// User schema
export const userSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().regex(/^[0-9]{10}$/).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    currentCart: currentCartSchema.optional(),
});

export const productSchema = Joi.object({
    productName: Joi.string().required(),
    unitPrice: Joi.number().min(0).required(),
    discount: Joi.number().min(0).max(100),
    description: Joi.string().optional(),
    storage: Joi.number(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\d{10}$/),
    password: Joi.string().min(8).required()
  }).xor('email', 'phone').with('email', 'password').with('phone', 'password');



