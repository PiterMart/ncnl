import { db } from "../../../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export async function GET(request) {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return new Response(
        JSON.stringify({ isAdmin: false }),
        { status: 200 }
      );
    }

    // Get user's role from Firestore
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    const userData = userDoc.data();

    return new Response(
      JSON.stringify({ 
        isAdmin: userData?.role === "admin" 
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ isAdmin: false }),
      { status: 200 }
    );
  }
} 