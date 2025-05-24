import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Post } from "../Komponen/Post";

interface UserType {
  user_id: string;
  name: string;
  username: string;
  profilePicture: string | null;
}

interface ReplyType {
  tweet_id: string;
  reply_id: string;
  content: string | null;
  image_path: string | null;
  user: UserType;
  likeCount?: number;
  replyCount?: number;
  createdAt: string;
}

export const TweetDetail = () => {
  const { tweet_id } = useParams<{ tweet_id: string }>();
  const [tweet, setTweet] = useState<any>(null);
  const [replies, setReplies] = useState<ReplyType[]>([]);

  useEffect(() => {
    const fetchThread = async () => {
      const res = await fetch(`http://localhost:3000/posts/${tweet_id}/thread`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setTweet(data.tweet);
      setReplies(data.replies || []);
    };
    fetchThread();
  }, [tweet_id]);

  if (!tweet) return <div style={{ color: "#fff" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", color: "#fff" }}>
      <Post
        tweet_id={tweet.tweet_id}
        name={tweet.user?.name || "Unknown"}
        handle={tweet.user?.username || "unknown"}
        content={tweet.content}
        image_path={tweet.image_path}
        profilePicture={tweet.user?.profilePicture}
        user_id={tweet.user?.user_id}
        likeCount={Number(tweet.likeCount) || 0}
        replyCount={Number(tweet.replyCount) || 0}
        createdAt={tweet.createdAt}
      />
      <h3 style={{ marginLeft: 20 }}>Replies</h3>
      <div style={{ marginLeft: 20 }}>
        {replies.length > 0 ? (
          replies.map((reply) => (
            <Post
              key={reply.tweet_id}
              tweet_id={reply.tweet_id}
              name={reply.user?.name || "Unknown"}
              handle={reply.user?.username || "unknown"}
              content={reply.content || ""}
              image_path={reply.image_path || ""}
              profilePicture={reply.user?.profilePicture || ""}
              user_id={reply.user?.user_id || ""}
              likeCount={Number(reply.likeCount) || 0}
              replyCount={Number(reply.replyCount) || 0}
              createdAt={reply.createdAt}
            />
          ))
        ) : (
          <div style={{ color: "#aaa" }}>No replies yet.</div>
        )}
      </div>
    </div>
  );
};