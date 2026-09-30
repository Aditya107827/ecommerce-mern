import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

function HeroSection() {
  const [heroImage, setHeroImage] = useState("");

  const navigate = useNavigate();

  // Fetch static hero image
  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await api.get("/store-settings");

        setHeroImage(
          response.data.heroImage?.url || ""
        );
      } catch (error) {
        console.error("Failed to load hero image:", error);
      }
    };

    fetchHeroImage();
  }, []);

  return (
    <section className="bg-gray-50">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pt-8 pb-10 md:grid-cols-2 md:pt-10 md:pb-12">

        {/* Content */}
        <div className="animate-[heroText_0.7s_ease-out_forwards]">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Welcome to E-Shop
          </p>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Discover products you'll love.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
            Explore our collection of quality products, thoughtfully selected
            for you.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Shop Now
            </button>

            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Explore Products
            </button>
          </div>
        </div>

        {/* Static Hero Image */}
        <div className="relative h-[320px] overflow-hidden rounded-2xl bg-gray-200 md:h-[450px]">
          {heroImage ? (
            <img
              src={heroImage}
              alt="E-Shop"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-gray-500">
                No hero image available
              </span>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes heroText {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </section>
  );
}

export default HeroSection;