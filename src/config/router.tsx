import { createBrowserRouter } from "react-router";
import { Layout } from "../Komponen/Layout";
import { HomePage } from "../pages/Homepages";
import { SearchPage } from "../pages/Searchpage";
import { UserPage } from "../pages/Userpage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "/userpage",
        element: <UserPage />,
      },
    ],
  },
]);