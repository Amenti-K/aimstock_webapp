import Cookies from "js-cookie";
import { Storage } from "redux-persist";

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  expires: 7,
  path: "/",
};

const cookieStorage: Storage = {
  getItem: (key: string) => {
    return Promise.resolve(Cookies.get(key) || null);
  },
  setItem: (key: string, value: string) => {
    Cookies.set(key, value, COOKIE_OPTIONS);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    Cookies.remove(key);
    return Promise.resolve();
  },
};

export default cookieStorage;
