import { useState, useEffect, useContext, createContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/services/supabaseService";

interface AuthContextProps {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
	isAdmin: () => boolean;
	isFaculty: () => boolean;
	isStudent: () => boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  profile: null,
  loading: true,
	isAdmin: () => false,
	isFaculty: () => false,
	isStudent: () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch user profile immediately after authentication
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
        }

        setProfile(profileData as UserProfile ?? null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch user profile on auth state change
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
        }

        setProfile(profileData as UserProfile ?? null);
      } else {
        setProfile(null);
      }
    });
  }, []);
  
  const isAdmin = () => profile?.role === "admin";
  const isFaculty = () => profile?.role === "faculty";
  const isStudent = () => profile?.role === "student";
  // Expose RBAC helpers for use in components
  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isFaculty, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
