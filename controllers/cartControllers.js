import { database } from "../database/database.js"
import { onValue, ref, set, get, orderByChild, push, equalTo, child, query, orderByKey, update, remove, startAt, off, limitToFirst } from "firebase/database";

export async function productExits(productID) {
    const productRef = ref(database, "products/" +productID);
    try {
        const snapshot = await get(productRef);
        if (snapshot.exists()) {
            return true;
        }

        return false;
    }
    catch (error) {
        return false;
    }
}

export async function getProductPrice(productID, productAmount) {
    const productRef = ref(database, "products/" +productID);
    try {
        const snapshot = await get(productRef);
        if (snapshot.exists()) {
            const productInfo = snapshot.val();
            const unitPrice = parseFloat(productInfo.unitPrice) ;
            const discount = parseFloat(productInfo.discount) ;
            const discountAmount = (unitPrice * productAmount) * (discount / 100)
            const productPrice = (unitPrice * productAmount) - discountAmount;
            return productPrice;
        }
        return null;
    }
    catch (error) {
        return null;
    }
}

export async function startShopping(req, res) {
    const userID = req.user.sub;
    const userRef = ref(database, "users/" + userID);
    const currentCartRef = child(userRef, "currentCart");
    try {
        const currentCart = await get(currentCartRef);

        if(currentCart.exists()) {
            return res.send("payment?");
        }
        else {
            await update(currentCartRef, {
                startTime: Math.floor(Date.now() / 1000),
                isPaid: false
            });
            return res.status(201).json({message: "new cart created"});
        }
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export async function getCurrentCart(req, res) {
    const userID = req.user.sub;
    const userRef = ref(database, "users/" + userID);
    const currentCartRef = child(userRef, "currentCart");

    try {
        const currentCart = await get(currentCartRef);
        if (currentCart.exists()) {
            // console.log(currentCart.val());
            return res.status(200).json({currentCart});
        }
        return res.status(404).send({message: "Current cart is empty"});
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({message: "Internal server error"});
    }
}

export async function updateCartProduct(req, res) {
    const updateInfo = req.body;
    const userID = req.user.sub;
    if (!updateInfo) {
        return res.status(400).json({error: "Missing request body"});
    }
    const productID = updateInfo.productID;
    if (await productExits(productID) ) {
        const userRef = ref(database, "users/" + userID);
        const currentCartRef = child(userRef, "currentCart");
        const currentCartProductRef = child(userRef, "currentCart/products");
        const newProductRef = child(currentCartProductRef, productID);
        const productRef = ref(database, "products/" + productID);

        try {
            delete updateInfo.productID;    
            const amountSnapshot = await get(child(productRef, "storage"));
            if (amountSnapshot.exists()) {
                const currentStorage = parseInt(amountSnapshot.val());
                const buyingStorage = updateInfo.productAmount;
                //hang trong kho
                if (currentStorage >= buyingStorage) {
                    const currentProduct = await get(child(userRef, "currentCart/products/" + productID));
                    const currentCart = await get(currentCartRef);
                    if (currentProduct.exists()) {
                        //so luong hien co
                        const currentAmount = currentProduct.val().productAmount;
                        const currentTotal = currentCart.val().totalPrice ?? 0;
                        const amount = currentAmount + buyingStorage;
                        if (amount <= 0) {
                            await remove(newProductRef);
                            const storage = currentStorage + currentAmount;
                            const newTotal = currentTotal - await getProductPrice(productID, currentAmount);
                            await update(currentCartRef, {totalPrice: newTotal});
                            await update(productRef, {storage });
                            return res.status(200).send({message: "Remove item successfully"})
                        }
                        await update(newProductRef, {productAmount: amount });
                        const storage = currentStorage - buyingStorage;
                        const newTotal = currentTotal + await getProductPrice(productID, buyingStorage);
                        await update(currentCartRef, {totalPrice: newTotal});
                        await update(productRef, {storage });
                        return res.status(200).send({message: "Added item successfully"})
                    }
                    else {
                        if (buyingStorage > 0) {
                            const currentTotal = currentCart.val().totalPrice ?? 0;
                            const newTotal = currentTotal + await getProductPrice(productID, buyingStorage);
                            await update(currentCartRef, {totalPrice: newTotal});
                            const storage = currentStorage - buyingStorage;
                            await update(productRef, {storage });
                            await update(newProductRef, updateInfo);
                        }
                        else {
                            return res.send({message: "Negative amount"});
                        }
                    }
                }
                else {
                    return res.send({message: "Not enough products"});
                }
                
            }
            
            return res.status(200).json({message: "Cart updated successfully"})
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({message: "internal server error"});
        }
    }
    return res.status(404).json({message: "product id not found"})

    
}

export async function endShopping(req, res) {
    const userID = req.user.sub;
    const userRef = ref(database, "users/" + userID);
    const currentCartRef = child(userRef, "currentCart");
    const salesRef = ref(database, "sales/")
    try {
        let cartSnapshot = await get(currentCartRef);
        if (cartSnapshot.exists()) {
            await update(currentCartRef, {
                endTime: Math.floor(Date.now() / 1000),
                isPaid: false
            });
            cartSnapshot = await get(currentCartRef);
            const invoiceRef =  await push(salesRef, {...cartSnapshot.val(), userID });
            const invoiceID = invoiceRef.key;
            remove(currentCartRef);
            return res.status(201).json({message: "Successfully paid", invoiceID});
        }   
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({message: "Internal server error"});
    }
}