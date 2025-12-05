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
// PERSIST ONLY AUTH (BEST PRACTICE)
// --------------------------------------------------
const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["user"], // only user is stored
};

// --------------------------------------------------
// ROOT REDUCER
// --------------------------------------------------
const rootReducer = combineReducers({
  auth: persistReducer(persistConfig, authReducer), // persisted
  post: postReducer, // not persisted
  socket: socketReducer, // not persisted
  chat: chatReducer, // not persisted
  realTimeNotification: rtnReducer, // not persisted
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
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
        ignoredPaths: ["socket.socket"], // ignore non-serializable socket
      },
    }),
});

// --------------------------------------------------
// EXPORT
// --------------------------------------------------
export const persistor = persistStore(store);
export default store;
