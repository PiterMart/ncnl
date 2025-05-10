'use client';

export default function LeadsTable({ leads, selectedLeads, setSelectedLeads }) {
  // const handleSelectLead = (lead) => {
  //   setSelectedLeads(prev => {
  //     const isSelected = prev.some(l => l.id === lead.id);
  //     if (isSelected) {
  //       return prev.filter(l => l.id !== lead.id);
  //     } else {
  //       return [...prev, lead];
  //     }
  //   });
  // };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Email Sent
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Created At
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              {/* <td className="px-6 py-4 border-b border-gray-200">
                <input
                  type="checkbox"
                  checked={selectedLeads.some(l => l.id === lead.id)}
                  onChange={() => handleSelectLead(lead)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
              </td> */}
              <td className="px-6 py-4 border-b border-gray-200">
                {lead.name}
              </td>
              <td className="px-6 py-4 border-b border-gray-200">
                {lead.email}
              </td>
              <td className="px-6 py-4 border-b border-gray-200">
                {lead.phone}
              </td>
              <td className="px-6 py-4 border-b border-gray-200">
                {lead.company || '-'}
              </td>
              <td className="px-6 py-4 border-b border-gray-200">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  lead.status === 'new' ? 'bg-green-100 text-green-800' :
                  lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-6 py-4 border-b border-gray-200">
                {lead.accountEmailSent ? (
                  <span className="text-green-600">Yes</span>
                ) : (
                  <span className="text-red-600">No</span>
                )}
              </td>
              <td className="px-6 py-4 border-b border-gray-200">
                {new Date(lead.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 