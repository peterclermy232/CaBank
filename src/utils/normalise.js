export const normaliseCard = c => ({
  id: c.id,
  holderName: c.holderName,
  brand: c.brand,
  cardType: c.cardType,
  last4: c.last4,
  balance: c.balance ?? 0,
  creditLimit: c.creditLimit ?? 0,
  validFrom: c.validFrom,
  goodThru: c.goodThru,
  color: (c.color ?? 'PRIMARY').toLowerCase(),
});