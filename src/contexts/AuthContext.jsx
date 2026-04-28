import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, doc, getDoc, onAuthStateChanged } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRole(data.role || "operator");
            setLocation(data.location || null);
          } else {
            setRole("operator"); // Default fallback
            setLocation(null);
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setRole("operator");
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
        setLocation(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    role,
    location,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
