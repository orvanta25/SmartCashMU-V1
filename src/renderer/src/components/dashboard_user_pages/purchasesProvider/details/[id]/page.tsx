// import InvoiceDetails from '../../../../../components/dashboard_user/purchasesProvider/InvoiceDetails';

// export default function InvoiceDetailsPage({ params }: { params: { id: string } }) {
//   const { id } = params;

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#2e186a]">
//       <InvoiceDetails invoiceId={id} />
//     </div>
//   );
// }

import { useParams } from "react-router-dom";
import InvoiceDetails from "../../../../../components/dashboard_user/purchasesProvider/InvoiceDetails";

export default function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2e186a]">
      {id ? <InvoiceDetails invoiceId={id} /> : <p>Loading...</p>}
    </div>
  );
}
