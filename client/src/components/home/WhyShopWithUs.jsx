import {
    FiTruck,
    FiShield,
    FiStar,
    FiHeadphones,
} from "react-icons/fi";

function WhyShopWithUs() {
    const benefits = [
        {
            title: "Reliable Delivery",
            description:
                "Your orders are carefully packed and delivered to your doorstep.",
            icon: FiTruck,
        },
        {
            title: "Secure Shopping",
            description:
                "Your personal information is handled with secure checkout and authentication.",
            icon: FiShield,
        },
        {
            title: "Quality Products",
            description:
                "Explore thoughtfully selected products made for everyday moments.",
            icon: FiStar,
        },
        {
            title: "Customer Support",
            description:
                "We're here to help whenever you need assistance with your order.",
            icon: FiHeadphones,
        },
    ];

    return (
        <section className="border-y border-gray-200 bg-white py-14 sm:py-16">
            <div className="mx-auto max-w-7xl px-6">

                {/* Section Header */}
                <div className="mb-10 text-center">
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Why E-Shop
                    </p>

                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Shopping made simple
                    </h2>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                        Everything you need for a smooth and reliable shopping
                        experience.
                    </p>
                </div>

                {/* Benefits */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {benefits.map((benefit) => {
                        const Icon = benefit.icon;

                        return (
                            <div
                                key={benefit.title}
                                className="group text-center"
                            >
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 transition duration-300 group-hover:bg-gray-900">
                                    <Icon
                                        className="text-xl text-gray-900 transition duration-300 group-hover:text-white"
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-gray-900">
                                    {benefit.title}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    {benefit.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}

export default WhyShopWithUs;