export interface UserType {
  user_id: string;
  name: string;
  username: string;
  profilePicture: string | null;
}

export interface ReplyType {
  tweet_id: string;
  reply_id: string;
  content: string | null;
  image_path: string | null;
  replyToId: string | null;
  user: UserType;
  likeCount?: number;
  replyCount?: number;
  createdAt: string;
  replies?: ReplyType[];
}