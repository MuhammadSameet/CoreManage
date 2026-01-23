"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { logOutUser } from "@/redux/actions/auth-actions/auth-actions";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();

  // const fetchAuthUser = useSelector((reduxData) => {
  //   return reduxData;
  // });
  // console.log(fetchAuthUser);

  const handleLogOut = () => {
    dispatch(logOutUser());
  };

  return (
    <div>
      <h1> Home </h1>
      <button onClick={handleLogOut}> Log Out </button>
    </div>
  );
};

export default Home;
