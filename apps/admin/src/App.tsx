import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./layout";
import Dashboard from "./apps/dashboard/Dashboard";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Layout>
          <Dashboard />
        </Layout>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
