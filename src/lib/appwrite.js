import { useState, useEffect, useCallback } from "react";
import { databases, Query, Databases, DocumentListResponse } from "appwrite";

const appwriteClient = new Databases("YOUR_PROJECT_ID", "YOUR_DATABASE_ID");

export const pageSize = 10;

// Get a collection with constraints and pagination
export function useAppwriteQuery(collectionId, constraints = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDocument, setLastDocument] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const baseQuery = new Query();
        constraints.forEach((constraint) => {
          baseQuery.equal(...constraint);
        });

        const response = await appwriteClient.listDocuments(
          collectionId,
          baseQuery,
          pageSize,
          0,
          "DESC",
          "createdAt"
        );

        setData(response.documents);
        setLastDocument(response.documents[response.documents.length - 1].$id);
        setHasMore(response.documents.length === pageSize);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionId, JSON.stringify(constraints)]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (!lastDocument || !hasMore) return;

    setLoading(true);
    try {
      const moreQuery = new Query();
      constraints.forEach((constraint) => {
        moreQuery.equal(...constraint);
      });

      const response = await appwriteClient.listDocuments(
        collectionId,
        moreQuery,
        pageSize,
        0,
        "DESC",
        "createdAt",
        lastDocument
      );

      setData((prev) => [...prev, ...response.documents]);
      setLastDocument(response.documents[response.documents.length - 1].$id);
      setHasMore(response.documents.length === pageSize);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collectionId, lastDocument, hasMore, JSON.stringify(constraints)]);

  return { data, loading, error, hasMore, loadMore };
}

// Get a single document
export function useAppwriteDocument(collectionId, documentId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) return;

    setLoading(true);
    const fetchDocument = async () => {
      try {
        const document = await appwriteClient.getDocument(
          collectionId,
          documentId
        );
        setData({ id: document.$id, ...document });
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [collectionId, documentId]);

  return { data, loading, error };
}

// CRUD operations hook
export function useAppwriteCRUD(collectionId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add document
  const addDocument = async (data) => {
    setLoading(true);
    try {
      const newDocument = await appwriteClient.createDocument(
        collectionId,
        data
      );
      setError(null);
      return newDocument.$id;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update document
  const updateDocument = async (documentId, updates) => {
    setLoading(true);
    try {
      await appwriteClient.updateDocument(collectionId, documentId, updates);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete document
  const deleteDocument = async (documentId) => {
    setLoading(true);
    try {
      await appwriteClient.deleteDocument(collectionId, documentId);
      setError(null);
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
export function useAppwriteCollectionJoin(
  sourceCollectionId,
  constraints = [],
  joins = [],
  options = {}
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDocument, setLastDocument] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [joinCache, setJoinCache] = useState({});

  const fetchDocument = async (collectionId, documentId) => {
    const cacheKey = `${collectionId}:${documentId}`;
    if (joinCache[cacheKey]) {
      return joinCache[cacheKey];
    }

    try {
      const document = await appwriteClient.getDocument(
        collectionId,
        documentId
      );
      setJoinCache((prev) => ({
        ...prev,
        [cacheKey]: { id: document.$id, ...document },
      }));

      return { id: document.$id, ...document };
    } catch (err) {
      console.error(`Error fetching ${collectionId} document:`, err);
      return null;
    }
  };

  const processDocuments = async (documents) => {
    const processedDocs = await Promise.all(
      documents.map(async (doc) => {
        const processedDoc = { id: doc.$id, ...doc };

        for (const join of joins) {
          const joinValue = processedDoc[join.sourceField];
          if (joinValue) {
            if (join.multiple && Array.isArray(joinValue)) {
              const joinedDocs = await Promise.all(
                joinValue.map((id) =>
                  fetchDocument(join.targetCollectionId, id)
                )
              );
              processedDoc[join.targetCollectionId] =
                joinedDocs.filter(Boolean);
            } else {
              const joinedDoc = await fetchDocument(
                join.targetCollectionId,
                joinValue
              );
              processedDoc[join.targetCollectionId] = joinedDoc;
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
        const baseQuery = new Query();
        constraints.forEach((constraint) => {
          baseQuery.equal(...constraint);
        });

        const response = await appwriteClient.listDocuments(
          sourceCollectionId,
          baseQuery,
          options.pageSize || 10,
          0,
          options.orderDirection || "DESC",
          options.orderField || "createdAt"
        );

        const processedDocs = await processDocuments(response.documents);

        setData(processedDocs);
        setLastDocument(response.documents[response.documents.length - 1].$id);
        setHasMore(response.documents.length === (options.pageSize || 10));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    sourceCollectionId,
    JSON.stringify(constraints),
    JSON.stringify(joins),
    options.pageSize,
    options.orderField,
    options.orderDirection,
  ]);

  const loadMore = async () => {
    if (!lastDocument || !hasMore) return;

    setLoading(true);
    try {
      const baseQuery = new Query();
      constraints.forEach((constraint) => {
        baseQuery.equal(...constraint);
      });

      const response = await appwriteClient.listDocuments(
        sourceCollectionId,
        baseQuery,
        options.pageSize || 10,
        0,
        options.orderDirection || "DESC",
        options.orderField || "createdAt",
        lastDocument
      );

      const moreDocs = await processDocuments(response.documents);

      setData((prev) => [...prev, ...moreDocs]);
      setLastDocument(response.documents[response.documents.length - 1].$id);
      setHasMore(response.documents.length === (options.pageSize || 10));
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
}

// Simple document count hook (one-time fetch)
export function useAppwriteCollectionCount(collectionId, constraints = []) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCount = async () => {
      try {
        const response = await appwriteClient.getDocumentList(
          collectionId,
          new Query()
        );
        setCount(response.total);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getCount();
  }, [collectionId, JSON.stringify(constraints)]);

  return { count, loading, error };
}

// Real-time document count hook
export function useLiveAppwriteCollectionCount(collectionId, constraints = []) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const subscription = appwriteClient.subscribe(
      [
        `databases.${collectionId}.*.create`,
        `databases.${collectionId}.*.update`,
        `databases.${collectionId}.*.delete`,
      ],
      (event) => {
        setCount(
          (prevCount) =>
            prevCount +
            (event.payload.operation === "create"
              ? 1
              : event.payload.operation === "delete"
              ? -1
              : 0)
        );
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [collectionId, JSON.stringify(constraints)]);

  return { count, loading, error };
}

// Multi-stat collector hook (gets multiple counts at once)
export function useMultiAppwriteCollectionStats(statsConfig) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStats = async () => {
      try {
        const results = await Promise.all(
          statsConfig.map(async ({ collectionId, constraints = [], name }) => {
            const response = await appwriteClient.getDocumentList(
              collectionId,
              new Query()
            );
            return { name, count: response.total };
          })
        );

        const statsObject = results.reduce(
          (acc, { name, count }) => ({
            ...acc,
            [name]: count,
          }),
          {}
        );

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
export function useAppwriteCollectionAggregates(
  collectionId,
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
        const baseQuery = new Query();
        constraints.forEach((constraint) => {
          baseQuery.equal(...constraint);
        });

        const response = await appwriteClient.getDocumentList(
          collectionId,
          baseQuery
        );
        const total = response.documents.reduce(
          (acc, doc) => acc + doc[field],
          0
        );
        const average = total / response.total;

        setAggregates({
          total,
          average,
        });
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getAggregates();
  }, [collectionId, field, JSON.stringify(constraints)]);

  return { aggregates, loading, error };
}







// useAppwriteQuery:
function UserList() {
  const {
    data: users,
    loading,
    error,
    hasMore,
    loadMore,
  } = useAppwriteQuery("users", [
    ["role", "==", "admin"],
    ["isActive", "==", true],
  ]);

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


// useAppwriteDocument:
function UserProfile({ userId }) {
  const { data: user, loading, error } = useAppwriteDocument("users", userId);

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


// useAppwriteCRUD
function UserManager() {
  const { addDocument, updateDocument, deleteDocument, loading, error } =
    useAppwriteCRUD("users");

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
      {/* User management UI */}
    </div>
  );
}


// useAppwriteCollectionJoin:
function OrderDetails({ orderId }) {
  const {
    data: order,
    loading,
    error,
  } = useAppwriteCollectionJoin(
    "orders",
    [["id", "==", orderId]],
    [
      {
        sourceField: "userId",
        targetCollectionId: "users",
        as: "user",
      },
      {
        sourceField: "productIds",
        targetCollectionId: "products",
        multiple: true,
        as: "products",
      },
    ]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div>
      <h1>Order Details</h1>
      <p>User: {order.user.name}</p>
      <ul>
        {order.products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
      <p>Total: {order.total}</p>
    </div>
  );
}


// useAppwriteCollectionCount:
function ActiveUserCount() {
  const { count, loading, error } = useAppwriteCollectionCount("users", [
    ["isActive", "==", true],
  ]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>Active Users: {count}</div>;
}


// useLiveAppwriteCollectionCount:
function PendingOrdersCount() {
  const { count, loading, error } = useLiveAppwriteCollectionCount("orders", [
    ["status", "==", "pending"],
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


// useMultiAppwriteCollectionStats:
function DashboardStats() {
  const { stats, loading, error } = useMultiAppwriteCollectionStats([
    {
      name: "totalUsers",
      collectionId: "users",
    },
    {
      name: "activeUsers",
      collectionId: "users",
      constraints: [["isActive", "==", true]],
    },
    {
      name: "pendingOrders",
      collectionId: "orders",
      constraints: [["status", "==", "pending"]],
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


// useAppwriteCollectionAggregates:
function RevenueStats() {
  const { aggregates, loading, error } = useAppwriteCollectionAggregates(
    "orders",
    [["status", "==", "completed"]],
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