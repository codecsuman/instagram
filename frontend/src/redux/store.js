import { combineReducers, configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice.js";
import postReducer from "./postSlice.js";
import socketReducer from "./socketSlice.js";
import chatReducer from "./chatSlice.js";
import rtnReducer from "./rtnSlice.js";

import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import storage from "redux-persist/lib/storage";

// --------------------------------------------------
// PERSIST ONLY AUTH USER (BEST PRACTICE)
// --------------------------------------------------
const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["user"],
};

// --------------------------------------------------
// ROOT REDUCER
// --------------------------------------------------
const rootReducer = combineReducers({
  auth: persistReducer(persistConfig, authReducer),
  post: postReducer,
  socket: socketReducer,
  chat: chatReducer,
  realTimeNotification: rtnReducer,
});

// --------------------------------------------------
// STORE
// --------------------------------------------------
const store = configureStore({
  reducer: rootReducer,

  devTools: true,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist internal actions
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],

        // Ignore socket instance object (non-serializable)
        ignoredPaths: ["socket.socket"],
      },
    }),
});

// --------------------------------------------------
// EXPORT
// --------------------------------------------------
export const persistor = persistStore(store);
export default store;
