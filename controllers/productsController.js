import { database } from "../database/database.js"
import { onValue, ref, set, get, orderByChild, push, remove, equalTo, child, query, orderByKey, update, startAt, off, limitToFirst } from "firebase/database";
import { productSchema } from "../schema.js";


const productsRef = ref(database, '/products');
const PAGE_SIZE = 10;


export async function addProduct(req, res) {
    const role = req.user.role;
    if (role != "admin") {
        return res.status(403).send({message: "Admin required"});
    }
    const product = req.body;
    const { error, value } = productSchema.validate(product);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const newProductRef = push(productsRef, {
        productName: product.productName,
        unitPrice: product.unitPrice,
        description: product.description ?? "",
        image: product.image,
        code: product.code,
        discount: product.discount ?? 0,
        storage: product.storage ?? 0
    });
    return res.status(201).json({message: "product added", productID: newProductRef.key});
}
//update product
export async function updateProduct(req, res) {
    const role = req.user.role;
    if (role != "admin") {
        return res.status(403).send({message: "Admin required"});
    }
    const updateInfo = req.body;
    const productID = req.params.id;
    if (!updateInfo) {
        return res.status(400).json({error: "Missing request body"});
    }
    const productRef = ref(database, "products/" + productID);
    try {
        const snapshot = await get(child(ref(database), `products/${productID}`));
        if(snapshot.exists()) {
            delete updateInfo.id;

            await update(productRef, updateInfo);
            return res.status(200).json({message: "Product updated successfully"})
        }
        else {
            return res.status(404).json({ message: "Product not found"});
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({message: "internal server error"});
    }

}

//get product byID
export async function getProductByID(req, res) {
    const productID = req.params.id;

    const productQuery = query(productsRef, ...[orderByKey(), equalTo(productID.toString())]);

    try {
      const snapshot = await get(productQuery);
      if (snapshot.exists()) {
        return res.status(200).json(snapshot.val()[productID]);
      }
      else {
        return res.status(404).send("Product not found");
      }
    }
    catch (error) {
      console.error(error);
      return res.send("Internal server error");
    }
}

//get products
export async function getProducts(pageNumber) {
    const offset = (pageNumber - 1) * PAGE_SIZE;

    const productsQuery = query(productsRef, ...[orderByKey(), startAt(offset.toString()), limitToFirst(PAGE_SIZE)]);

    try {
        const totalSnapshot = await get(productsRef);
        const totalJson = totalSnapshot.toJSON();
        const totalPage = Object.keys(totalJson).length;
        const snapshot = await get(productsQuery);
        const products = snapshot.val();
        return JSON.stringify({currentPage: pageNumber, totalPage , products });
    }
    catch (error) {
        return JSON.stringify({ message: "error"});
    }

}

export async function deleteProductByID(req, res) {
    const role = req.user.role;
    if (role != "admin") {
        return res.status(403).send({message: "Admin required"});
    }
    const productID = req.params.id;
    const productRef = ref(database, "products/" + productID);
    try {
        await remove(productRef);
        return res.status(204).end();
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({message: "Internal server error"});
    }

}
