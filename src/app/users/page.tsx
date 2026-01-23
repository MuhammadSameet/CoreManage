"use client";

import React, { useEffect, useState } from "react";
import {
  fetchAllUsers,
  deleteUser,
} from "@/redux/actions/user-actions/user-actions";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const Users = () => {
  const [loader, setLoader] = useState(false);
  const [updateDocVal, setUpdateDocVal] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const dispatch = useDispatch<AppDispatch>();

  const getAllUsers = useSelector((reduxData: any) => {
    // return reduxData;
    return reduxData?.userStates?.usersList;
  });
  // console.log('Users: ', reduxData);
  console.log('Users: ', getAllUsers);

  useEffect(() => {
    setLoader(true);
    dispatch(fetchAllUsers()).finally(() => {
      setLoader(false);
    });
  }, [dispatch]);

  //   Handle delete user...!
  // const handleDel = async (user: any) => {
  //   if (user) {
  //     console.log("User: ", user);
  //     dispatch(deleteUser(user?.docId)).finally(() => {
  //       alert("User deleted");
  //       dispatch(fetchAllUsers());
  //     });
  //   }
  // };
  const handleDel = async (user: any) => {
    if (!user) return;

    try {
      console.log("Deleting user:", user);
      await dispatch(deleteUser(user.docId)); // delete + Redux refresh
      alert("User deleted successfully");
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    }
  };

  // Edit handler...!
  const editHandler = (user: any) => {
    if (user) {
      console.log(user);
      setSelectedUser(null);
      setSelectedUser(user);
      setUpdateDocVal(user?.name);
    };
  };

  // Update handler...!
  const updateHandler = async () => {
    if (selectedUser) {
      console.log('User: ', selectedUser);
      const docRef = doc(db, 'Users', selectedUser?.docId);

      const updatedData = {
        name: updateDocVal
      }
      console.log(updatedData);

      await updateDoc(docRef, updatedData);
      setUpdateDocVal('');
      setSelectedUser(null);
      dispatch(fetchAllUsers());
    }
  };

  return (
    <div>
      <h1> Users List </h1>

      {loader && <h1> Loading... </h1>}

      <div style={{ display: selectedUser ? 'block' : 'none' }}>
        <input
          type="text"
          placeholder="Update Doc"
          value={updateDocVal}
          onChange={e => setUpdateDocVal(e.target.value)}
        />

        <button onClick={updateHandler}> Update Document </button>
      </div>

      <ul>
        {getAllUsers?.map((user: any) => {
          return (
            <li key={user?.uid}>
              {user?.name},
              {user?.email},
              <button onClick={() => handleDel(user)}> Delete </button>
              <button onClick={() => editHandler(user)}> Edit </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Users;
