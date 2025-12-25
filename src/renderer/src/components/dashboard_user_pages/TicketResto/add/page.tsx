
import { useEffect, useState } from 'react';
import AddTicketResto from '../../../../components/dashboard_user/TicketResto/add';

export default function AddTicketRestoPage() {
  const [_isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  return (
    <div className="p-4 animate-fade-in">
      <AddTicketResto /> {/* Retirez la prop onClose */}
    </div>
  );
}