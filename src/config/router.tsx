import { createBrowserRouter, redirect } from "react-router";
import { Layout } from "../Komponen/Layout";
import { HomePage } from "../pages/Homepages";
import { SearchPage } from "../pages/Searchpage";
import { UserPage } from "../pages/Userpage";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";

const authenticate = () => {
  const token = localStorage.getItem("token");
  if (token) { // edit disni
    return redirect("/login");
  }
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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

