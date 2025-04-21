import { db, auth } from "../../../../firebase/firebaseConfig";
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    console.log('Received token:', token);

    // Find the lead with this token
    const leadsRef = collection(db, "leads");
    const leadQuery = query(leadsRef, where("accountToken", "==", token));
    const leadSnapshot = await getDocs(leadQuery);

    if (leadSnapshot.empty) {
      console.log('No lead found with token:', token);
      return new Response(
        JSON.stringify({ message: "Invalid token" }),
        { status: 400 }
      );
    }

    const leadDoc = leadSnapshot.docs[0];
    const leadData = leadDoc.data();
    console.log('Found lead data:', leadData);

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        leadData.email,
        password
      );
      console.log('User created successfully:', userCredential.user.uid);

      // Create user document with only essential data
      const userData = {
        email: leadData.email,
        name: leadData.name,
        role: "user", // Default role
        createdAt: new Date(),
        migratedFromLead: true
      };
      console.log('Creating user document with data:', userData);

      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      console.log('User document created successfully');

      // Delete the lead document
      await deleteDoc(leadDoc.ref);
      console.log('Lead document deleted successfully');

      return new Response(
        JSON.stringify({ 
          message: "Account created successfully",
          userId: userCredential.user.uid,
          email: leadData.email
        }),
        { status: 200 }
      );
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      return new Response(
        JSON.stringify({ 
          message: `Firebase error: ${firebaseError.message}`,
          code: firebaseError.code
        }),
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('General error:', err);
    return new Response(
      JSON.stringify({ 
        message: `Failed to create account: ${err.message}`,
        error: err
      }),
      { status: 500 }
    );
  }
} 