// All user related action function are defined here...!

import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FETCH_ALL_USERS, START_FETCHING_USERS } from "@/redux/reducers/user-reducer/user-reducer";
import { AppDispatch } from "@/redux/store";
import { User } from "@/redux/reducers/user-reducer/user-reducer";

const fetchAllUsers = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(START_FETCHING_USERS());
    const fetchUsersFromFB = await getDocs(collection(db, "Users"));
    // console.log('Users: ' , fetchUsersFromFB);
    const users: User[] = [];
    fetchUsersFromFB.forEach((doc) => {
      //   console.log(doc.id, " => ", doc.data());

      const obj: User = {
        ...(doc.data() as Omit<User, 'docId'>), // Cast data to User type, excluding docId
        docId: doc.id,
      };
      users.push(obj);
    });
    // console.log("Users: ", users);

    // Target user data...!
    const targetUsers = [...users].map((itemUser: User) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = itemUser; // password is removed here
      return rest;
    });

    // console.log(targetUsers);
    dispatch(FETCH_ALL_USERS(targetUsers));
  };
};

const deleteUser = (userDocId: string) => {
  return async (dispatch: AppDispatch) => {
    try {

      console.log("Deleting user with docId:", userDocId);


      console.log("User doc id: ", userDocId);
      await deleteDoc(doc(db, "Users", userDocId));

      dispatch(fetchAllUsers());


    } catch (error: unknown) {
      console.log("Error deleting user:", error);
    }
  };
};

export { fetchAllUsers, deleteUser };
