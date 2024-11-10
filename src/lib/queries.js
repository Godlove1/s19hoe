import useSWR from "swr";
import fetcher from "./swrFetcher";

export function useUser(userId) {
  const { data, error, isValidating } = useSWR(`users/${userId}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60000,
  });

  return {
    user: data,
    isLoading: !error && !data,
    isError: error,
    isValidating,
  };
}

export function usePosts(constraints = [], orderBy = null, pageSize = 10) {
  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const queryParams = {
    constraints,
    orderByField: orderBy ? orderBy[0] : null,
    orderDirection: orderBy ? orderBy[1] : null,
    pageSize,
  };

  const { data, error, isValidating, mutate } = useSWR(
    ["posts", queryParams],
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 120000,
    }
  );

  useEffect(() => {
    if (data) {
      setPosts(data.docs);
      setLastDoc(data.lastDoc);
    }
  }, [data]);

  const loadMore = async () => {
    if (lastDoc) {
      setIsLoadingMore(true);
      const moreData = await fetcher(["posts", { ...queryParams, lastDoc }]);
      setPosts((prevPosts) => [...prevPosts, ...moreData.docs]);
      setLastDoc(moreData.lastDoc);
      setIsLoadingMore(false);
    }
  };

  return {
    posts,
    isLoading: !error && !data,
    isError: error,
    isValidating,
    loadMore,
    isLoadingMore,
    hasMore: !!lastDoc,
  };
}




// import React from "react";
// import { useUser, usePost } from "./firebaseQueries";

// export default function UserProfile({ userId, postId }) {
//   const { user, isLoading: userLoading, isError: userError } = useUser(userId);
//   const { post, isLoading: postLoading, isError: postError } = usePost(postId);

//   if (userLoading || postLoading) return <div>Loading...</div>;
//   if (userError || postError) return <div>Error loading data</div>;

//   return (
//     <div>
//       <h1>User Profile</h1>
//       <pre>{JSON.stringify(user, null, 2)}</pre>
//       <h2>Latest Post</h2>
//       <pre>{JSON.stringify(post, null, 2)}</pre>
//     </div>
//   );
// }



// import React from "react";
// import { usePosts } from "./firebaseQueries";

// export default function PostList() {
//   const { posts, isLoading, isError, loadMore, isLoadingMore, hasMore } =
//     usePosts(
//       [["category", "==", "technology"]], // constraints
//       ["createdAt", "desc"], // orderBy
//       5 // pageSize
//     );

//   if (isLoading) return <div>Loading posts...</div>;
//   if (isError) return <div>Error loading posts</div>;

//   return (
//     <div>
//       <h1>Technology Posts</h1>
//       {posts.map((post) => (
//         <div key={post.id}>
//           <h2>{post.title}</h2>
//           <p>{post.content}</p>
//         </div>
//       ))}
//       {hasMore && (
//         <button onClick={loadMore} disabled={isLoadingMore}>
//           {isLoadingMore ? "Loading more..." : "Load more"}
//         </button>
//       )}
//     </div>
//   );
// }
