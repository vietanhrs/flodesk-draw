import { GrainProvider } from "@flodesk/grain";
import "./App.css";
import { RouterProvider } from "react-router-dom";

import { router } from "./routes";

function App() {
  return (
    <GrainProvider breakpoints={{ mobile: 768, tablet: 1280 }}>
      <RouterProvider router={router} />
    </GrainProvider>
  );
}

export default App;
