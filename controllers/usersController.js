import { database } from "../database/database.js"
import { onValue, ref, set, get, orderByChild, push, equalTo, child, query, orderByKey, update } from "firebase/database";
import { userSchema, loginSchema } from "../schema.js";
import bcrypt from "bcrypt";
import jwt  from "jsonwebtoken";

const usersRef = ref(database, '/users');
const saltRounds = 10;

export async function createUser(req, res) {
    const user = req.body;
    const { error, value } = userSchema.validate(user);
    if (error) {
    return res.status(400).json({ message: error.details[0].message });
    }

  const newUserRef = push(usersRef);
  const emailQuery = query(usersRef, ...[orderByChild("email"), equalTo(user.email)]);

  try {
    const snapshot = await get(emailQuery);
    if (snapshot.exists()) {
      // Email already exists in database, return error response
      return res.status(400).json({ message: 'Email already exists' });
    } else {
      
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      await set( newUserRef, {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        role: "user",
        password: hashedPassword
      });

      return res.status(200).send({ message: "New user added" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }  
}

export async function getUserByID(req, res) {
  const userID = req.params.id;

  const userQuery = query(usersRef, ...[orderByKey(), equalTo(userID.toString())]);

  try {
    const snapshot = await get(userQuery);
    if (snapshot.exists()) {
      return res.status(200).json(snapshot.val())[userID];
    }
    else {
      return res.status(404).send("User not found");
    }
  }
  catch (error) {
    console.error(error);
    return res.send("Internal server error");
  }

}

export async function updateUser(req, res) {
  const updateInfo = req.body;
  const userID = req.params.id;
  if (!updateInfo) {
      return res.status(400).json({error: "Missing request body"});
  }

  const userRef = ref(database, "users/" + userID);

  try {
      const snapshot = await get(child(ref(database), `users/${userID}`));
      if(snapshot.exists()) {
          delete updateInfo.id;

          await update(userRef, updateInfo);
          return res.status(200).json({message: "User updated successfully"})
      }
      else {
          return res.status(404).json({ message: "User not found"});
      }
  }
  catch (error) {
      console.log(error);
      return res.status(500).json({message: "Internal server error"});
  }
}

export async function getAllUsers(req, res) {
  const role = req.user.role;
  if (role != "admin") {
    return res.status(403).send({message: "Admin required"});
  }
  const usersQuery = query(usersRef, ...[orderByChild("role"), equalTo("user")]);
  try {
    const allUsers = await get(usersQuery);
    if (allUsers.exists()) {
      const users = allUsers.val()
      return res.status(200).json({users});
    }
    return res.status(404).send({message: "No users available"});
  }
  catch (error) {
    console.log(error);
    return res.status(500).send({message: "Internal server error"});
  }
}
