'use client'

import { useState, useEffect, useCallback } from "react";
import {
  doc,
  collection,
  query,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  onSnapshot,
  getAggregateFromServer,
  sum,
  average,
  setDoc,
} from "firebase/firestore";
 import { db } from "./firebase";
import toast from "react-hot-toast";


export const pageSize = 10;

// const [refresh, setRefreshUI] = useState(0)
let refresh = 0;
  
// Get a collection with constraints and pagination
export function useFirestoreQuery(
  collectionName,
  constraints = [],
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const baseQuery = query(
          collection(db, collectionName),
          ...constraints,
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );

        const snapshot = await getDocs(baseQuery);
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData(docs);
        console.log(docs, "collection:", collectionName,"documents")
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === pageSize);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, ...constraints, refresh]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (!lastDoc || !hasMore) return;

    setLoading(true);
    try {
      const moreQuery = query(
        collection(db, collectionName),
        ...constraints,
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      );

      const snapshot = await getDocs(moreQuery);
      const newDocs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setData((prev) => [...prev, ...newDocs]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collectionName, lastDoc, hasMore, ...constraints]);

  return { data, loading, error, hasMore, loadMore };
}

// Get a single document
export function useFirestoreDoc(collectionName, docId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) return;

    setLoading(true);
    const fetchDoc = async () => {
      try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
         const data = { id: docSnap.id, ...docSnap.data() };
         setData(data);
         console.log(
           `Fetched data from Firestore collection '${collectionName}', document '${docId}':`,
           data
         );
        } else {
          setData(null);
        }
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [collectionName, docId, refresh]);

  return { data, loading, error };
}

// CRUD operations hook
export function useFirestoreCRUD(collectionName) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add document
  const addDocument = async (data) => {
    setLoading(true);
    try {
      const docRef = doc(collection(db, collectionName));
      const Id = docRef.id;

      const object = {
        id: Id,
        ...data,
        createdAt: new Date().toISOString(),
      };

       await toast.promise(setDoc(docRef, object), {
         loading: "Creating ...",
         success: <b>Saved!</b>,
         error: <b>Could not Save.</b>,
       });
      
      refresh++

      setError(null);
      return Id;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update document
  const updateDocument = async (docId, data) => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      setError(null);
    //  refresh++
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete document
  const deleteDocument = async (docId) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, collectionName, docId));
      setError(null);
      refresh++
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    addDocument,
    updateDocument,
    deleteDocument,
    loading,
    error,
  };
}

// JOIN AND GET DATA FROM MULTIPLE COLLECTIONS
// Generic join 2 collection configuration
export function useFirestoreCollectionJoin  (
  sourceCollection,
  constraints = [],
  joins = [],
  options = {}
)  {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [joinCache, setJoinCache] = useState({});

  const fetchDocument = async (collectionName, documentId) => {
    const cacheKey = `${collectionName}:${documentId}`;
    if (joinCache[cacheKey]) {
      return joinCache[cacheKey];
    }

    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      const documentData = docSnap.exists()
        ? { id: docSnap.id, ...docSnap.data() }
        : null;

      setJoinCache((prev) => ({
        ...prev,
        [cacheKey]: documentData,
      }));

      return documentData;
    } catch (err) {
      console.error(`Error fetching ${collectionName} document:`, err);
      return null;
    }
  };

  const processDocuments = async (docs) => {
    const processedDocs = await Promise.all(
      docs.map(async (doc) => {
        const docData = doc.data();
        const processedDoc = { id: doc.id, ...docData };

        for (const join of joins) {
          const joinValue = processedDoc[join.sourceField];
          if (joinValue) {
            if (join.multiple && Array.isArray(joinValue)) {
              const joinedDocs = await Promise.all(
                joinValue.map((id) => fetchDocument(join.targetCollection, id))
              );
              processedDoc[join.targetCollection] = joinedDocs.filter(Boolean);
            } else {
              const joinedDoc = await fetchDocument(
                join.targetCollection,
                joinValue
              );
              processedDoc[join.targetCollection] = joinedDoc;
            }
          }
        }

        return processedDoc;
      })
    );

    return processedDocs;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const sourceRef = collection(db, sourceCollection);
        const baseQuery = query(
          sourceRef,
          ...constraints,
          orderBy(
            options.orderField || "createdAt",
            options.orderDirection || "desc"
          ),
          limit(options.pageSize || 10)
        );

        const snapshot = await getDocs(baseQuery);
        const processedDocs = await processDocuments(snapshot.docs);

        setData(processedDocs);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === (options.pageSize || 10));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    db,
    sourceCollection,
    JSON.stringify(constraints),
    JSON.stringify(joins),
    options.pageSize,
    options.orderField,
    options.orderDirection,
  ]);

  const loadMore = async () => {
    if (!lastDoc || !hasMore) return;

    setLoading(true);
    try {
      const sourceRef = collection(db, sourceCollection);
      const moreQuery = query(
        sourceRef,
        ...constraints,
        orderBy(
          options.orderField || "createdAt",
          options.orderDirection || "desc"
        ),
        startAfter(lastDoc),
        limit(options.pageSize || 10)
      );

      const snapshot = await getDocs(moreQuery);
      const moreDocs = await processDocuments(snapshot.docs);

      setData((prev) => [...prev, ...moreDocs]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === (options.pageSize || 10));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
  };
}; 


// multiple collections
export function useMultiJoinFirestoreQuery({
  collection: collectionName,
  constraints = [],
  joins = [],
}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  async function fetchJoinedDoc(joinConfig, foreignId) {
    try {
      const joinedDoc = await getDoc(doc(db, joinConfig.collection, foreignId));
      if (!joinedDoc.exists()) return null;

      return {
        id: joinedDoc.id,
        ...joinedDoc.data(),
      };
    } catch (err) {
      console.error(`Error fetching ${joinConfig.collection}:`, err);
      return null;
    }
  }

  async function processDocuments(docs) {
    const processedDocs = await Promise.all(
      docs.map(async (doc) => {
        const baseData = {
          id: doc.id,
          ...doc.data(),
        };

        // Process joins sequentially
        const joinedData = {};
        for (const joinConfig of joins) {
          const foreignId = baseData[joinConfig.foreignKey];
          if (foreignId) {
            const joinedDoc = await fetchJoinedDoc(joinConfig, foreignId);
            if (joinedDoc) {
              joinedData[joinConfig.as] = joinedDoc;
            }
          }
        }

        return {
          ...baseData,
          ...joinedData,
        };
      })
    );

    return processedDocs;
  }

  // Initial fetch
  useEffect(() => {
    let isMounted = true;

    async function fetchInitialData() {
      try {
        setLoading(true);
        const collectionRef = collection(db, collectionName);
        const baseQuery = query(collectionRef, ...constraints, limit(pageSize));

        const snapshot = await getDocs(baseQuery);
        const processedDocs = await processDocuments(snapshot.docs);

        console.log("multi-join-data:", processedDocs);

        if (isMounted) {
          setDocuments(processedDocs);
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(snapshot.docs.length === pageSize);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching data:", err);
          setError(err.message);
          setLoading(false);
        }
      }
    }

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [collectionName, JSON.stringify(constraints), pageSize]);

  // Load more function
  const loadMore = async () => {
    if (!lastDoc || !hasMore || loading) return;

    try {
      setLoading(true);

      const collectionRef = collection(db, collectionName);
      const nextQuery = query(
        collectionRef,
        ...constraints,
        startAfter(lastDoc),
        limit(pageSize)
      );

      const snapshot = await getDocs(nextQuery);
      const moreDocs = await processDocuments(snapshot.docs);

      setDocuments((prev) => [...prev, ...moreDocs]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (err) {
      console.error("Error loading more:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    documents,
    loading,
    error,
    hasMore,
    loadMore,
  };
}



// AGGREGATE FUNCTION HOOKS GETTING COUNTS AND SUM OF FIELDS

// Simple document count hook (one-time fetch)
export function useCollectionCount(collectionName, constraints = []) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCount = async () => {
      try {
        const ref = collection(db, collectionName);
        const q = query(ref, ...constraints);
        const snapshot = await getCountFromServer(q);
        setCount(snapshot.data().count);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getCount();
  }, [collectionName, ...constraints]);

  return { count, loading, error };
}

// Real-time document count hook
export function useLiveCollectionCount(collectionName, constraints = []) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ref = collection(db, collectionName);
    const q = query(ref, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setCount(snapshot.size);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, ...constraints]);

  return { count, loading, error };
}

// Multi-stat collector hook (gets multiple counts at once)
export function useMultiCollectionStats(statsConfig) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStats = async () => {
      try {
        const results = await Promise.all(
          statsConfig.map(
            async ({ collection: collectionName, constraints = [], name }) => {
              const ref = collection(db, collectionName);
              const q = query(ref, ...constraints);
              const snapshot = await getCountFromServer(q);
              return { name, count: snapshot.data().count };
            }
          )
        );

        const statsObject = results.reduce(
          (acc, { name, count }) => ({
            ...acc,
            [name]: count,
          }),
          {}
        );
 console.log(statsObject, "stats")
        setStats(statsObject);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, [JSON.stringify(statsConfig)]);

  return { stats, loading, error };
}

// Advanced stats hook with aggregation
export function useCollectionAggregates(
  collectionName,
  constraints = [],
  field
) {
  const [aggregates, setAggregates] = useState({
    total: 0,
    average: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAggregates = async () => {
      try {
        const ref = collection(db, collectionName);
        const q = query(ref, ...constraints);
        const snapshot = await getAggregateFromServer(q, {
          total: sum(field),
          average: average(field),
        });

        setAggregates({
          total: snapshot.data().total,
          average: snapshot.data().average,
        });
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getAggregates();
  }, [collectionName, field, ...constraints]);

  return { aggregates, loading, error };
}





//  USE CASES/ HOW TO USE THE HOOKS DATA QUERYING

// 1.Fetching documents with constraints and pagination: useFirestoreQuery hook


function UserList() {
  const {
    data: users,
    loading,
    error,
    hasMore,
    loadMore,
  } = useFirestoreQuery("users", [where("role", "==", "admin")]);

  if (loading && !users.length) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
      {loading && <div>Loading more...</div>}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}


// 2. Getting a single document: useFirestoreDoc hook

function UserProfile({ userId }) {
  const { data: user, loading, error } = useFirestoreDoc("users", userId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}


//  3. CRUD operations: useFirestoreCRUD hook

function UserManager() {
  const { addDocument, updateDocument, deleteDocument, loading, error } =
    useFirestoreCRUD("users");

  const handleAddUser = async (userData) => {
    try {
      
      const newUserId = await addDocument(userData);
      console.log("Added user:", newUserId);
    } catch (err) {
      console.error("Failed to add user:", err);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await updateDocument(userId, updates);
      console.log("Updated user:", userId);
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDocument(userId);
      console.log("Deleted user:", userId);
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  return (
    <div>
      {loading && <div>Processing...</div>}
      {error && <div>Error: {error}</div>}
      {users?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
      {loading && <div>Loading more...</div>}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}
  

//USE CASE FOR COUNTS
// 4.Simple Count (one-time fetch)

function UserCounter() {
  const { count, loading, error } = useCollectionCount("users", [
    where("isActive", "==", true),
  ]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>Active Users: {count}</div>;
}


// 5. Live Count (real-time updates):
function LiveOrderCounter() {
  const { count, loading, error } = useLiveCollectionCount("orders", [
    where("status", "==", "pending"),
  ]);

  return (
    <div>
      <h3>Pending Orders</h3>
      {loading ? (
        <span>Loading...</span>
      ) : (
        <span className="badge">{count}</span>
      )}
    </div>
  );
}


//6. Multiple Stats (dashboard overview):
function DashboardStats() {
  const { stats, loading, error } = useMultiCollectionStats([
    {
      name: "totalUsers",
      collection: "users",
    },
    {
      name: "activeUsers",
      collection: "users",
      constraints: [where("isActive", "==", true)],
    },
    {
      name: "pendingOrders",
      collection: "orders",
      constraints: [where("status", "==", "pending")],
    },
  ]);

  if (loading) return <div>Loading stats...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="stats-grid">
      <div>Total Users: {stats.totalUsers}</div>
      <div>Active Users: {stats.activeUsers}</div>
      <div>Pending Orders: {stats.pendingOrders}</div>
    </div>
  );
}

//7.Advanced Stats (with aggregation):
function RevenueStats() {
  const { aggregates, loading, error } = useCollectionAggregates(
    "orders",
    [where("status", "==", "completed")],
    "amount"
  );

  if (loading) return <div>Loading revenue data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Revenue Statistics</h3>
      <div>Total Revenue: ${aggregates.total.toFixed(2)}</div>
      <div>Average Order Value: ${aggregates.average.toFixed(2)}</div>
    </div>
  );
}


