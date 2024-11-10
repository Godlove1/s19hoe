import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "./firebase";

const fetcher = async (key) => {
  const [path, queryParams] = Array.isArray(key) ? key : [key, null];
  const [collectionName, docId] = path.split("/");

  if (docId) {
    // Fetch a single document
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Document does not exist");
    }
  } else {
    // Fetch multiple documents
    let q = collection(db, collectionName);

    if (queryParams) {
      const { constraints, orderByField, orderDirection, pageSize, lastDoc } =
        queryParams;

      if (constraints) {
        constraints.forEach(([field, operator, value]) => {
          q = query(q, where(field, operator, value));
        });
      }

      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection || "asc"));
      }

      if (pageSize) {
        q = query(q, limit(pageSize));
      }

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
    }

    const querySnapshot = await getDocs(q);
    return {
      docs: querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
    };
  }
};

export default fetcher;
