import { database } from "../database/database.js"
import { onValue, ref, set, get, orderByChild, push, equalTo, child, query, orderByKey, update, remove, startAt, off, limitToFirst } from "firebase/database";

const PAGE_SIZE = 10;
const SalesRef = ref(database, "sales");
// export async function getPersonalHistory(userID , pageNumber) {
//     const offset = (pageNumber - 1) * PAGE_SIZE;

//     const historyQuery = query(SalesRef, ...[orderByChild("userID"), startAt(userID, offset.toString()), limitToFirst(PAGE_SIZE)]);

//     try {
//         const totalSnapshot = await get(SalesRef);
//         const totalJson = totalSnapshot.toJSON();
//         // console.log(totalJson);
//         const totalPage = Object.keys(totalJson).length;
//         console.log("here");
//         const snapshot = await get(historyQuery);
//         console.log("here too");
//         const invoices = snapshot.val();
//         console.log(invoices.val());
//         return JSON.stringify({currentPage: pageNumber, totalPage , invoices });
//     }
//     catch (error) {
//         return JSON.stringify({ message: "error"});
//     }

// }

export async function getAllHistory(req, res) {
    const historyQuery = query(SalesRef);

    try {
        const historySnapshot = await get(historyQuery);
        if (historySnapshot.exists()) {
            const history = historySnapshot.val()
            return res.status(200).json({history});
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({message: "Internal server error"});
    }
}

export async function getPersonalHistory(req, res) {
    const userID = req.user.sub;
    const historyQuery = query(SalesRef, ...[orderByChild("userID"), equalTo(userID)]);

    try {
        const historySnapshot = await get(historyQuery);
        if (historySnapshot.exists()) {
            const history = historySnapshot.val()
            // console.log(history);
            return res.status(200).json({history});
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({message: "Internal server error"});
    }

}

export async function getHistoryById(req, res) {
    const historyID = req.params.id;

    const historyQuery = query(SalesRef, ...[orderByKey(), equalTo(historyID.toString())]);

    try {
      const snapshot = await get(historyQuery);
      if (snapshot.exists()) {
        return res.status(200).json(snapshot.val()[historyID]);
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