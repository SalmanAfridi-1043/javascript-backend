const createSafePayment = (payment) => {
  return {
    _id: payment._id,
    order: payment.order,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    paidAt: payment.paidAt,
    createdAt: payment.createdAt,
  };
};

export { createSafePayment };
