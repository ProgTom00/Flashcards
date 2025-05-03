import { WandSparkles, User, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useEffect } from "react";
import { useToast } from "../../hooks/use-toast";

interface TopbarProps {
  title?: string;
  initialUser?: {
    id: string;
    email: string | null;
  };
}

export default function Topbar({ title = "Flashcards", initialUser }: TopbarProps) {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();

  // Initialize auth store with user data from server
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser, setUser]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to logout");
      }

      // Clear user from store
      setUser(null);

      // Redirect to login page
      window.location.href = "/auth/login";
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to logout",
      });
    }
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-gray-900 border-b border-gray-800 p-3 px-4 md:p-4 md:px-6 shadow-md">
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center space-x-3 group">
          <WandSparkles className="size-4 text-blue-400 group-hover:text-teal-400 transition-colors duration-300" />
          <h1 className="font-mono text-lg md:text-xl font-semibold bg-gradient-to-r from-blue-300 to-teal-300 bg-clip-text text-transparent group-hover:from-teal-300 group-hover:to-purple-300 transition-colors duration-300">
            {title}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="flex items-center space-x-2 text-gray-300">
                <User className="size-4" />
                <span className="text-sm hidden sm:inline">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-300 hover:text-gray-100 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="size-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
