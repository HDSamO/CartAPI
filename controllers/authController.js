import { database } from "../database/database.js"
import { onValue, ref, set, get, orderByChild, push, equalTo, child, query, orderByKey } from "firebase/database";
import { loginSchema } from "../schema.js";
import bcrypt from "bcrypt";
import jwt  from "jsonwebtoken";

const usersRef = ref(database, '/users');

export async function login(req, res) {
    const loginInfo = req.body;
    const { error, value } = loginSchema.validate(loginInfo);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    let userQuery;
    if (loginInfo.hasOwnProperty('email')) {
        userQuery = query(usersRef, ...[orderByChild("email"), equalTo(loginInfo.email)]);
    }
    else {
        userQuery = query(usersRef, ...[orderByChild("phone"), equalTo(loginInfo.phone)]);
    }
    const snapshot = await get(userQuery);
    if (snapshot.exists()) {
        const userNode = snapshot.val();
        const userID = Object.keys(userNode)[0];
        const userInfo = Object.values(userNode)[0];
        const validPass = await bcrypt.compare(loginInfo.password, userInfo.password);
        if (!validPass) {
            return res.status(400).send("Invalid password");
        }

        const accessToken = jwt.sign( {sub: userID, role: userInfo.role}, process.env.ACCESS_TOKEN_SECRET);
        return res.json({accessToken: accessToken});
    }
    else {
      // do not have email
      return res.status(404).send("User not found");
    }
}






