
import {
  getDocs,
  setDoc,
  collection,
  where,
  query,
  doc,
  orderBy,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export const pageSize = 3;

export const PLATFORM_NAME = "Restou";
const DB_NAME = "restou";

export const allFoodsRef = collection(db, DB_NAME, "cameroon", "allDishes");
export const allUsersRef = collection(db, DB_NAME, "cameroon", "allUsers");
export const allDriversRef = collection(db, DB_NAME, "cameroon", "allDrivers");
export const allOrdersRef = collection(db, DB_NAME, "cameroon", "allOrders");
export const allAddonsRef = collection(db, DB_NAME, "cameroon", "allAddons");
export const allFeedBackRef = collection(db, DB_NAME, "cameroon", "allFeedBack");
export const allRewardsRef = collection(
  db,
  DB_NAME,
  "cameroon",
  "allRewards"
);
export const allRestaurantsRef = collection(
  db,
  DB_NAME,
  "cameroon",
  "allRestaurants"
);
export const blogsRef = collection(db, DB_NAME, "cameroon", "allRecipes");
export const allCatsRef = collection(db, DB_NAME, "cameroon", "allCategories");
export const paymentsRef = collection(db, DB_NAME, "cameroon", "allPayments");
export const adsRef = collection(db, DB_NAME, "cameroon", "allAds");
export const announcementsRef = collection(
  db,
  DB_NAME,
  "cameroon",
  "allAnnouncements"
);
export const brandsRef = collection(db, DB_NAME, "cameroon", "allAdvertisers");
export const allScheduledMealsRef = collection(
  db,
  DB_NAME,
  "cameroon",
  "allScheduledMeals"
);
export const allCustomRequestsRef = collection(
  db,
  DB_NAME,
  "cameroon", 
  "allCustomRequests"
);

// get single document
export async function getDocument(docRef) {
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    return docSnap.data();
  } else {
    console.log("No such document!");
    return null;
  }
}

// update single document
export async function updateDocument(docRef, updatedFields) {
  try {
    await updateDoc(docRef, updatedFields);
    console.log("Document successfully updated!");
  } catch (error) {
    console.error("Error updating document: ", error);
  }
}

// delete document
export async function deleteDocument(docRef) {
  try {
    await deleteDoc(docRef);
    console.log("Document successfully deleted!");
    return true;
  } catch (error) {
    console.error("Error removing document: ", error);
    throw error;
  }
}

export function singleUserRef(userId) {
  const ref = doc(db, DB_NAME, "cameroon", "allUsers", `${userId}`);
  return ref;
}

export function singleCustomRequestRef(Id) {
  const ref = doc(db, DB_NAME, "cameroon", "allCustomRequests", `${Id}`);
  return ref;
}


export function singleRewardRef(Id) {
  const ref = doc(db, DB_NAME, "cameroon", "allRewards", `${Id}`);
  return ref;
}


export function singleScheduledMealRef(userId) {
  const ref = doc(db, DB_NAME, "cameroon", "allScheduledMeals", `${userId}`);
  return ref;
}

export function singleCatRef(id) {
  const ref = doc(db, DB_NAME, "cameroon", "allCategories", `${id}`);
  return ref;
}

export function singleAnnounceRef(id) {
  const ref = doc(db, DB_NAME, "cameroon", "allAnnouncements", `${id}`);
  return ref;
}

export function brandRef(id) {
  const ref = doc(db, DB_NAME, "cameroon", "allAdvertisers", `${id}`);
  return ref;
}

export function adRef(adId) {
  const ref = doc(db, DB_NAME, "cameroon", "allAds", `${adId}`);
  return ref;
}

export function addonRef(adId) {
  const ref = doc(db, DB_NAME, "cameroon", "allAddons", `${adId}`);
  return ref;
}

export function driverRef(driverId) {
  const ref = doc(db, DB_NAME, "cameroon", "allDrivers", `${driverId}`);
  return ref;
}

export function restaurantRef(userId) {
  const ref = doc(db, DB_NAME, "cameroon", "allRestaurants", `${userId}`);
  return ref;
}

export function foodRef(dishId) {
  const ref = doc(db, DB_NAME, "cameroon", "allDishes", `${dishId}`);
  return ref;
}

export function feedbackRef(userId) {
  const ref = doc(db, DB_NAME, "cameroon", "allMessages", `${userId}`);
  return ref;
}

export function orderRef(userId) {
  const ref = doc(db, DB_NAME, "cameroon", "allOrders", `${userId}`);
  return ref;
}

export function blogArticle(articleId) {
  const ref = doc(db, DB_NAME, "cameroon", "allRecipes", `${articleId}`);
  return ref;
}

export function userPayment(userId) {
  const ref = doc(db, DB_NAME, "cameroon", "allPayments", `${userId}`);
  return ref;
}

export function notLogInError(text) {
  // return toast.error(text);
}
