import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Post } from "../Komponen/Post";
import { Reply } from "../Komponen/Reply";
import { ReplyType, UserType } from "../types/types";

export const TweetDetail = ({ tweet_id: propTweetId }: { tweet_id?: string }) => {
  const params = useParams<{ tweet_id: string }>();
  const tweet_id = propTweetId || params.tweet_id;
  const [tweet, setTweet] = useState<any>(null);
  const [replies, setReplies] = useState<ReplyType[]>([]);

  const fetchThread = useCallback(async () => {
    const res = await fetch(`http://localhost:3000/posts/${tweet_id}/thread`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setTweet(data.tweet);
    setReplies(data.replies || []);
  }, [tweet_id]);

  useEffect(() => {
    if (tweet_id) fetchThread();
  }, [tweet_id, fetchThread]);

  if (!tweet) return <div style={{ color: "#fff" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", color: "#fff" }}>
      <Post
        tweet_id={tweet.tweet_id}
        name={tweet.user?.name || "Unknown"}
        handle={tweet.user?.username || "unknown"}
        content={tweet.content}
        image_path={tweet.image_path}
        profilePicture={
          tweet.user?.profilePicture
            ? tweet.user.profilePicture.startsWith("http")
              ? tweet.user.profilePicture
              : `http://localhost:3000/${tweet.user.profilePicture}`
            : "http://localhost:3000/uploads/default-profile.png"
        }
        user_id={tweet.user?.user_id}
        likeCount={Number(tweet.likeCount) || 0}
        replyCount={Number(tweet.replyCount) || 0}
        createdAt={tweet.createdAt}
        refreshThread={fetchThread} // Pass refresh function
      />
      <h3 style={{ marginLeft: 20, padding: "20px 0 20px 0" }}>Replies</h3>
      <div style={{ marginLeft: 20 }}>
        {replies.length > 0 ? (
          replies.map((reply) => (
            <Reply
              key={reply.tweet_id}
              reply={reply}
              tweet_id={reply.tweet_id}
              userId={tweet.user?.user_id}
              setReplies={setReplies}
              depth={0}
              refreshThread={fetchThread} // Pass refresh function
            />
          ))
        ) : (
          <div style={{ color: "#aaa" }}>No replies yet.</div>
        )}
      </div>
    </div>
  );
};