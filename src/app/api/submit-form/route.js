import { db } from "../../../../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { generateToken } from "../../../../utils/tokenGenerator";

export async function POST(request) {
  try {
    const formData = await request.json();
    const { email, name, phone, company, message } = formData;

    // Validate required fields
    if (!email || !name || !phone) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Generate account creation token
    const token = generateToken();

    // Add form submission to leads collection with token
    const leadsRef = collection(db, "leads");
    const leadDoc = await addDoc(leadsRef, {
      email,
      name,
      phone,
      company: company || null,
      message: message || null,
      createdAt: new Date(),
      hasAccount: false,
      status: "new",
      accountEmailSent: false,
      accountToken: token
    });

    return new Response(
      JSON.stringify({ 
        message: "Form submitted successfully",
        leadId: leadDoc.id
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Failed to submit form" }),
      { status: 500 }
    );
  }
} 