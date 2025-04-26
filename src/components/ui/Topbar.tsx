import { WandSparkles, User } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useEffect } from "react";

interface TopbarProps {
  title?: string;
  initialUser?: {
    id: string;
    email: string | null;
  };
}

export default function Topbar({ title = "Flashcards", initialUser }: TopbarProps) {
  const { user, setUser } = useAuthStore();

  // Initialize auth store with user data from server
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser, setUser]);

  return (
    <header className="sticky top-0 z-10 w-full bg-gray-900 border-b border-gray-800 p-3 px-4 md:p-4 md:px-6 shadow-md">
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center space-x-3 group">
          <WandSparkles className="size-4 text-blue-400 group-hover:text-teal-400 transition-colors duration-300" />
          <h1 className="font-mono text-lg md:text-xl font-semibold bg-gradient-to-r from-blue-300 to-teal-300 bg-clip-text text-transparent group-hover:from-teal-300 group-hover:to-purple-300 transition-colors duration-300">
            {title}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {user && (
            <div className="flex items-center space-x-2 text-gray-300">
              <User className="size-4" />
              <span className="text-sm">{user.email}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
