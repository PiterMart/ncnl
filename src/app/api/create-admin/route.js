import { db, auth } from "../../../../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        { status: 400 }
      );
    }

    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Create user document with admin role
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      role: "admin",
      createdAt: new Date()
    });

    return new Response(
      JSON.stringify({ 
        message: "Admin account created successfully",
        userId: userCredential.user.uid 
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Failed to create admin account" }),
      { status: 500 }
    );
  }
} 