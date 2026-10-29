
const ShippingPolicy = () => {
    return (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
                Shipping Policy
            </h1>

            <p className="mb-8 text-sm text-gray-500">
                Last updated: October 2026
            </p>

            <div className="space-y-6 leading-7 text-gray-700">
                <section>
                    <h2 className="mb-2 text-xl font-semibold text-gray-900">
                        1. Order Processing
                    </h2>
                    <p>
                        Orders are processed after confirmation. Processing
                        time may vary depending on product availability,
                        order volume, and other operational factors. Any
                        applicable processing estimates will be communicated
                        through our website or order updates.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-semibold text-gray-900">
                        2. Delivery Time
                    </h2>
                    <p>
                        Estimated delivery time depends on the delivery
                        address, courier service, and product availability.
                        Delivery estimates are not guaranteed unless
                        explicitly stated.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-semibold text-gray-900">
                        3. Shipping Charges
                    </h2>
                    <p>
                        Any applicable shipping or delivery charges will be
                        displayed during checkout before you confirm your
                        order.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-semibold text-gray-900">
                        4. Tracking and Delivery Issues
                    </h2>
                    <p>
                        If tracking information is available, it will be
                        shared through the contact details provided with
                        your order. If your order is delayed, damaged, or
                        marked delivered but not received, contact our
                        support team for assistance.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-semibold text-gray-900">
                        5. Incorrect Address
                    </h2>
                    <p>
                        Please check your delivery address and contact
                        details before placing an order. Contact support
                        as soon as possible if you notice an error. Address
                        changes may not be possible after dispatch.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-semibold text-gray-900">
                        6. Contact Support
                    </h2>
                    <p>
                        For shipping-related questions, contact Resinaura
                        through the contact details listed on our website.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default ShippingPolicy;
