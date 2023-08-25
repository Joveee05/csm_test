const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('../utils/catchAsync');
const { updateSubscription } = require('../utils/helpers');

const addNewCustomer = async (email, fullName) => {
  const customer = await stripe.customers.create({
    email,
    description: fullName,
  });
  return customer;
};

const getCustomerById = async (id) => {
  const customer = await stripe.customers.retrieve(id);
  return customer;
};

const stripeSession = async (productId, userId) => {
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      client_reference_id: userId,
      line_items: [
        {
          price: productId,
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3000/success.html',
      cancel_url: 'http://localhost:3000/cancel.html',
    });
  } catch (error) {
    return error;
  }
  return session;
};

const createSubscription = async (stripeSession) => {
  const user = stripeSession.client_reference_id;
  await updateSubscription(user);
};

const webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') createSubscription(event.data.object);

  res.status(200).json({ received: true });
};

module.exports = {
  addNewCustomer,
  getCustomerById,
  stripeSession,
  webhookCheckout,
};
