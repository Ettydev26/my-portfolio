import { useAuth } from "@/hooks/useAuth";
import LoginForm from "./LoginForm";
import AdminDashboard from "./AdminDashboard";

const AdminPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="h-10 w-10 animate-pulse rounded-full bg-primary/30" />
      </div>
    );
  }

  return user ? <AdminDashboard /> : <LoginForm />;
};

export default AdminPage;
