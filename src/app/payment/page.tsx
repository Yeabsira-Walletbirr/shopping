'use client';
import PriceSummary from '@/components/paymentSummery';
import ProtectedRoute from '@/utils/protector';
import { useSearchParams } from 'next/navigation';

const PriceSummaryPage = () => {
  const searchParams = useSearchParams();
  const id = Number(searchParams.get('id'));
  const quantity = Number(searchParams.get('quantity'));

  return (<ProtectedRoute>
    <PriceSummary id={id} quantity={quantity} />;
  </ProtectedRoute>)

};

export default PriceSummaryPage
