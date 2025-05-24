import { createBrowserRouter, redirect } from "react-router-dom";
import { Layout } from "../Komponen/Layout";
import { HomePage } from "../pages/Homepages";
import { SearchPage } from "../pages/Searchpage";
import { UserPage } from "../pages/Userpage";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { ProtectedRoute } from "./ProtectedRoute";
import { TweetDetail } from "../pages/TweetDetail";

const authenticate = () => {
  const token = localStorage.getItem("token");
  if (!token) { 
    return redirect("/login");
  }
};    

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: authenticate,
      },
      {
        path: "search",
        element: <SearchPage />,
        loader: authenticate,
      },
      {
        path: "userpage",
        element: <UserPage />,
        loader: authenticate,
      },
      {
        path: "userpage/:id",
        element: <UserPage />,
        loader: authenticate,
      },
      {
        path: "tweet/:tweet_id",
        element: <TweetDetail />,
        loader: authenticate,
      }
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);