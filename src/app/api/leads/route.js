import { NextResponse } from 'next/server';
import { db } from '../../../../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    // Get all leads from Firestore
    const leadsCollection = collection(db, 'leads');
    const leadsSnapshot = await getDocs(leadsCollection);
    
    // Transform the data to include the document ID
    const leads = leadsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
} 