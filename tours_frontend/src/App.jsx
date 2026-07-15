import React from "react";
import Routing from "./Routing/Routing";
import { Toaster } from "sonner";
import { AppContextProvider } from "./context/AppContext";

const App = () => {
  return (
    <AppContextProvider>
      <Routing />
      <Toaster position="top-right" />
    </AppContextProvider>
  );
};

export default App;
