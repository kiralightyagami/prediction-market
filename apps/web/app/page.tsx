"use client"
import { useSupabase } from "./hooks/useSupabase";
import { useUser } from "./hooks/useUser";


export default function Home() {
  // create a Component
  const {claims}= useUser();
  const supabase = useSupabase();
  return (
    <div>
      {!claims && <button
        onClick={async () => {
          await supabase.auth.signInWithWeb3({
            chain: "solana",
            statement: "signin with solana",
          });
        }}
      >
        Signin with solana
      </button>
      }
      {claims && <button onClick={async () => {
        await supabase.auth.signOut()
      }}>
        logout
        </button>}
    </div>
  );
}
