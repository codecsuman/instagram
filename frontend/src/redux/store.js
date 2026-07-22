import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
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

import authReducer from "./authSlice.js";
import chatReducer from "./chatSlice.js";
import postReducer from "./postSlice.js";
import rtnReducer from "./rtnSlice.js";
import socketReducer from "./socketSlice.js";

// --------------------------------------------------
// PERSIST CONFIG
// --------------------------------------------------
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user"],
};

const rtnPersistConfig = {
  key: "rtn",
  storage,
  whitelist: ["notifications", "unreadCount"],
};

// Socket: DON'T persist socket instance (non-serializable)
const socketPersistConfig = {
  key: "socket",
  storage,
  blacklist: ["socket"],
};

// --------------------------------------------------
// ROOT REDUCER
// --------------------------------------------------
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  post: postReducer,
  chat: chatReducer,
  socket: persistReducer(socketPersistConfig, socketReducer),
  realTimeNotification: persistReducer(rtnPersistConfig, rtnReducer),
});

// --------------------------------------------------
// STORE
// --------------------------------------------------
const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.MODE !== "production",
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
          "socket/setSocket",
        ],
        ignoredPaths: ["socket.socket"],
      },
    }),
});

// --------------------------------------------------
// PERSISTOR
// --------------------------------------------------
export const persistor = persistStore(store);
export default store;
