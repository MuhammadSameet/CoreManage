// All user related action function are defined here...!

import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FETCH_ALL_USERS } from "@/redux/reducers/user-reducer/user-reducer";
import { AppDispatch } from "@/redux/store";

const fetchAllUsers = () => {
  return async (dispatch: any) => {
    const fetchUsersFromFB = await getDocs(collection(db, "Users"));
    // console.log('Users: ' , fetchUsersFromFB);
    const users: any[] = [];
    fetchUsersFromFB.forEach((doc) => {
      //   console.log(doc.id, " => ", doc.data());

      const obj = {
        ...doc.data(),
        docId: doc.id,
      };
      users.push(obj);
    });
    // console.log("Users: ", users);

    // Target user data...!
    const targetUsers = [...users].map((itemUser: any) => {
      //   console.log(itemUser);
      const { password, ...rest } = itemUser;
      return rest;
    });

    // console.log(targetUsers);
    targetUsers &&
      dispatch(FETCH_ALL_USERS(targetUsers));
      // dispatch({
      //   type: FETCH_ALL_USERS,
      //   payload: targetUsers
      // });
  };
};

const deleteUser = (userDocId: string) => {
  return async (dispatch: AppDispatch) => {
    try {

      console.log("Deleting user with docId:", userDocId);


      console.log("User doc id: ", userDocId);
      await deleteDoc(doc(db, "Users", userDocId));

      dispatch(fetchAllUsers());


    } catch (error) {
      console.log("Error deleting user:", error);
    }
  };
};

export { fetchAllUsers, deleteUser };
