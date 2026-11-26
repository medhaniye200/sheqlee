import { BrowserRouter } from "react-router-dom";
import BoardRoutes from "./routes/BoardRoutes";

export default function App() {
  return <BrowserRouter><BoardRoutes /></BrowserRouter>;
}
