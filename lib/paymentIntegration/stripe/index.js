import "server-only";
import Stripe from "stripe";

export default function initStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // Avoid throwing during module load when no key is present.
    // Consumers will get a clear error when trying to use Stripe APIs.
    // eslint-disable-next-line no-console
    console.warn("Stripe secret key not set — payments are disabled");
    return null;
  }

  const stripe = new Stripe(key);
  return stripe;
}

export const stripe = initStripe();

function ensureStripe() {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY to enable payments.",
    );
  }
}

/**
 * Creates a new customer in Stripe using the provided data.
 *
 * @param {Stripe.CustomerCreateParams} data - The customer data to create a new customer in Stripe.
 * @param {Stripe.RequestOptions} [options] - The options for creating the customer in Stripe.
 * @returns {Promise<Stripe.Response<Stripe.Customer>>} A promise that resolves to the newly created Stripe customer object.
 * @throws Will throw an error if the customer creation fails.
 */

export async function createCustomer(data, options) {
  try {
    ensureStripe();
    return stripe.customers.create(data, options);
  } catch (e) {
    throw e;
  }
}

/**
 * Retrieves a customer from Stripe by their ID.
 *
 * @param {string} id - The ID of the customer to retrieve.
 * optional params
 * @param {Stripe.CustomerRetrieveParams} [params] - The optional parameters for retrieving the customer from Stripe.
 * @param {Stripe.RequestOptions} [options] - The optional options for retrieving the customer from Stripe.
 * @returns {Promise<Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>>} A promise that resolves to the Stripe customer object.
 * @throws Will throw an error if the customer retrieval fails.
 */

export async function getCustomerById(id, params, options) {
  try {
    ensureStripe();
    return stripe.customers.retrieve(id, params, options);
  } catch (e) {
    throw e;
  }
}

/**
 * Retrieves a list of customers from Stripe.
 *
 * @param {Stripe.CustomerListParams} [params] - The optional parameters for retrieving the list of customers from Stripe.
 * @returns {Promise<Stripe.ApiList<Stripe.Customer>>} A promise that resolves to the Stripe customer list object.
 * @throws Will throw an error if the customer list retrieval fails.
 */
export async function getAllCustomers(params) {
  try {
    ensureStripe();
    return stripe.customers.list(params);
  } catch (e) {
    throw e;
  }
}

/**
 * Creates a new customer in Stripe, if a customer with the same values for the provided `matcherKeys` does not already exist.
 *
 * @param {Stripe.CustomerCreateParams} data - The customer data to create a new customer in Stripe.
 * @param {Stripe.RequestOptions} [options] - The options for creating the customer in Stripe.
 * @param {[keyof Stripe.CustomerCreateParams]} [matcherKeys] - The keys to use when searching for a customer in Stripe.
 * @returns {Promise<Stripe.Response<Stripe.Customer>> | undefined} A promise that resolves to the newly created Stripe customer object.
 * @throws Will throw an error if the customer creation fails.
 */
export async function createUniqueCustomer(data, options, matcherKeys = []) {
  try {
    const query = matcherKeys
      .map((key) => `${key}:"${data[key]}"`)
      .join(" AND ");
    ensureStripe();
    const findedCustomer = await stripe.customers.search({
      query,
    });
    if (findedCustomer?.data?.length < 1) {
      return stripe.customers.create(data, options);
    }
    throw new Error(
      `Provided ${matcherKeys.join()} matched with already existing customer.`,
    );
  } catch (e) {
    throw e;
  }
}

export async function deleteCustomer(id) {
  if (!id) throw new Error("Customer id is required");

  try {
    ensureStripe();
    const getCustomer = await getCustomerById(id);
    if (getCustomer.deleted) return;
    return stripe.customers.del(id);
  } catch (e) {
    throw e;
  }
}

/**
 * Requests a refund from Stripe with the provided parameters.
 *
 * @param {Stripe.RefundCreateParams} params - The parameters required to create a refund in Stripe.
 * @param {Stripe.RequestOptions} [options] - The optional request options for the refund.
 * @returns {Promise<Stripe.Response<Stripe.Refund>>} A promise that resolves to the refund object.
 * @throws Will throw an error if the refund request fails.
 */

export async function requestRefund(params, options) {
  try {
    ensureStripe();
    const refund = await stripe.refunds.create(params, options);
    return refund;
  } catch (e) {
    throw e;
  }
}

/**
 * Retrieves a list of refunds for a given charge id.
 *
 * @param {string} chargeId - The id of the charge to retrieve refunds for.
 * @param {Stripe.ListRefundsParams} [params] - The optional parameters for retrieving the list of refunds from Stripe.
 * @param {Stripe.RequestOptions} [options] - The optional request options for retrieving the list of refunds from Stripe.
 * @returns {Promise<Stripe.Refund[]>} A promise that resolves to an array of refund objects.
 * @throws Will throw an error if the refund list retrieval fails.
 */
export async function getRefundList(
  chargeId,
  params = {
    limit: 1,
  },
  options,
) {
  // get refund by charge id
  try {
    ensureStripe();
    const refund = await stripe.refunds.list(
      {
        charge: chargeId,
        ...params,
      },
      options,
    );
    return refund.data;
  } catch (e) {
    throw e;
  }
}
