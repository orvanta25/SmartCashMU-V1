import { Decimal } from 'decimal.js';
import { VenteParLot } from '../../../types/product';

export const calculatePriceWithVenteParLot = (
  priceUnit: number,
  ventesParLot: VenteParLot[] | undefined,
  quantity: number
): number => {
  const unitPrice = new Decimal(Number(priceUnit) || 0);
  let totalPrice = new Decimal(0);
  let remainingQty = Number(quantity) || 0;

  if (!ventesParLot || ventesParLot.length === 0) {
    return unitPrice.mul(remainingQty).toNumber();
  }

  // Sort lots from largest to smallest quantity
  const sortedLots = [...ventesParLot].sort((a, b) => (b.qte || 0) - (a.qte || 0));

  for (const lot of sortedLots) {
    const lotQty = Number(lot.qte) || 0;
    const lotPrice = new Decimal(Number(lot.prix) || 0);

    if (lotQty <= 0) continue; 

    if (remainingQty >= lotQty) {
      const lotCount = Math.floor(remainingQty / lotQty);
      totalPrice = totalPrice.add(lotPrice.mul(lotCount));
      remainingQty -= lotCount * lotQty;
    }
  }

  // Remaining units at normal unit price
  if (remainingQty > 0) {
    totalPrice = totalPrice.add(unitPrice.mul(remainingQty));
  }

  return totalPrice.toNumber();
};
