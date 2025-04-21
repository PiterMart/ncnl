import { db, auth } from "../../../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Helper function to check if user is admin
async function isAdmin(userId) {
  const userDoc = await getDoc(doc(db, "users", userId));
  const userData = userDoc.data();
  return userData?.role === "admin";
}

export async function GET(request) {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    // Check if current user is admin
    if (!(await isAdmin(currentUser.uid))) {
      return new Response(
        JSON.stringify({ message: "Forbidden" }),
        { status: 403 }
      );
    }

    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    
    const users = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        role: userData.role || "user",
        createdAt: userData.createdAt?.toDate() || null
      });
    });

    return new Response(
      JSON.stringify({ users }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    // Check if current user is admin
    if (!(await isAdmin(currentUser.uid))) {
      return new Response(
        JSON.stringify({ message: "Forbidden" }),
        { status: 403 }
      );
    }

    const { userId, action } = await request.json();

    if (!userId || !action) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404 }
      );
    }

    if (action === "makeAdmin") {
      await updateDoc(userRef, {
        role: "admin",
      });
    } else if (action === "removeAdmin") {
      await updateDoc(userRef, {
        role: "user",
      });
    } else {
      return new Response(
        JSON.stringify({ message: "Invalid action" }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Success" }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      { status: 500 }
    );
  }
} 