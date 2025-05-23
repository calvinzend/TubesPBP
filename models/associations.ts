import { User } from "./User";
import { Follower } from "./Follower";

// A user can follow many users (as the follower)
User.hasMany(Follower, {
  foreignKey: "user_id",
  as: "following",
});

// A user can be followed by many users (as the followed)
User.hasMany(Follower, {
  foreignKey: "following_id",
  as: "followers",
});

// For eager loading: Follower belongs to User as followerUser (the follower)
Follower.belongsTo(User, {
  foreignKey: "user_id",
  as: "followerUser",
});

// For eager loading: Follower belongs to User as followedUser (the followed)
Follower.belongsTo(User, {
  foreignKey: "following_id",
  as: "followedUser",
});