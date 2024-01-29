import { useEffect } from 'react';
import Cookies from 'js-cookie';

export const useCookies = () => {
  const setCookie = (name, value, options) => {
    Cookies.set(name, value, options);
  };

  const getCookie = (name) => {
    return Cookies.get(name);
  };

  const removeCookie = (name) => {
    Cookies.remove(name);
  };

  useEffect(() => {
    return () => {
      // Clean up cookies when the component unmounts
      // For example, remove specific cookies or clear all cookies
    };
  }, []);

  return { setCookie, getCookie, removeCookie };
};
