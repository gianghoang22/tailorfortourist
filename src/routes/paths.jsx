import SignIn from "../pages/signIn/signIn";
import SignUp from "../pages/signUp/signUp";

import HomePage from "../pages/home/HomePage";
import BookingPage from "../pages/booking/BookingPage";
import Checkout from "../pages/checkout/Checkout";

import ProductPage from "../pages/product/ProductPage";
import ProductDetail from "../pages/product/ProductDetail";
import Fabric from "../pages/fabric/Fabric";

import UserProfile from "../pages/profile/UserProfile";
import ChangePassword from "../pages/profile/ChangePassword";

import CustomSuit from "../pages/customsuit/CustomSuit";
import CustomStyle from "../pages/customSuit/custom/CustomStyle";
import CustomLining from "../pages/customSuit/custom/CustomLining";
import CustomFabric from "../pages/customSuit/custom/CustomFabric";

import StaffDashboard from "../pages/staff/StaffDashboard";
import OrderList from "../pages/staff/staffManager/OrderList";
import BookingList from "../pages/staff/staffManager/BookingList";
import ShipmentList from "../pages/staff/staffManager/ShipmentList";

import OrderHistory from "../pages/profile/OrderHistory";
import Measurement from "../pages/profile/Measurement";

import Cart from "../pages/cart/cart";
import { element } from "prop-types";
import BookingThanks from "../pages/booking/BookingThanks";

import StaffManagement from "../pages/managerdashboard/StaffManagement";
import ManagerDashboard from "../pages/managerdashboard/ManagerDashboard";

export const routes = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/manager",
    element: <ManagerDashboard />,
    children: [
      {
        path: "staff-management", // This will be /manager/staff-management
        element: <StaffManagement />,
      },
      // Add other children routes here if needed
    ],
  },
  {
    path: "/booking",
    element: <BookingPage />,
  },
  {
    path: "/booking-thanks",
    element: <BookingThanks />,
  },
  {
    path: "/cart",
    element: <Cart />,
  },
  {
    path: "/profile",
    element: <UserProfile />,
    children: [
      {
        path: "change-password", // This will be /profile/change-password
        element: <ChangePassword />,
      },
      {
        path: "order-history", // This will be /profile/change-password
        element: <OrderHistory />,
      },
      {
        path: "measurement", // This will be /profile/change-password
        element: <Measurement />,
      },
      // Add other profile-related children routes here if needed
    ],
  },
  {
    path: "/product-collection",
    element: <ProductPage />,
  },
  {
    path: "/product-collection/:id",
    element: <ProductDetail />,
  },
  {
    path: "/checkout",
    element: <Checkout />,
  },
  {
    path: "/fabric",
    element: <Fabric />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },

  {
    path: "/staff",
    element: <StaffDashboard />,
    children: [
      {
        path: "",
        element: <StaffDashboard />,
      },
      {
        path: "order",
        element: <OrderList />,
      },
      {
        path: "booking",
        element: <BookingList />,
      },
      {
        path: "shipment",
        element: <ShipmentList />,
      },
    ],
  },
  {
    path: "/custom-suits",
    element: <CustomSuit />,
    children: [
      {
        path: "fabric",
        element: <CustomFabric />,
      },
      {
        path: "style",
        element: <CustomStyle />,
      },
      {
        path: "lining",
        element: <CustomLining />,
      },
    ],
  },

  {
    path: "/staff",
    element: <StaffDashboard />,
    children: [
      {
        path: "",
        element: <StaffDashboard />,
      },
      {
        path: "order",
        element: <OrderList />,
      },
      {
        path: "booking",
        element: <BookingList />,
      },
      {
        path: "shipment",
        element: <ShipmentList />,
      },
    ],
  },
  {
    path: "/custom-suits",
    element: <CustomSuit />,
    children: [
      {
        path: "",
        element: <CustomFabric />,
      },
      {
        path: "fabric",
        element: <CustomFabric />,
      },
      {
        path: "style",
        element: <CustomStyle />,
      },
      {
        path: "lining",
        element: <CustomLining />,
      },
    ],
  },
];
