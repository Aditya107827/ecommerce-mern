import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
function HeroSection() {
  const [heroImage, setHeroImage] = useState("");

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await api.get("/store-settings");

        setHeroImage(response.data.heroImage?.url || "");
      } catch (error) {
        console.error("Failed to load hero image");
      }
    };

    fetchHeroImage();
  }, []);

  const navigate = useNavigate();

  return (
    <section className="bg-gray-50">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">

        {/* Content */}
        <div>
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

        {/* Hero Image */}
        <div className="relative h-[320px] overflow-hidden rounded-2xl bg-gray-200 md:h-[450px]">
          {heroImage ? (
            <img
              src={heroImage}
              alt="E-Shop"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center md:min-h-[450px]">
              <span className="text-sm text-gray-500">
                Hero Image
              </span>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export default HeroSection;