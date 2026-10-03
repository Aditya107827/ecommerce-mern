import { useEffect, useState } from "react";
import { Leaf, Sparkles, Gift } from "lucide-react";
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
    <section
      className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/bg.png')",
      }}
    >
      <div className="absolute inset-0 bg-white/55" />


      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pt-4 pb-10 md:grid-cols-2 md:pt-2 md:pb-12">

        {/* Content */}
        <div className="animate-[heroText_0.7s_ease-out_forwards]">

          <div className="mb-5">
            <img
              src="/images/logo.png"
              alt="Resin Aura"
              className="h-auto w-[310px] object-contain"
            />
          </div>


          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#52606f]">
            Welcome to Resin Aura
          </p>

          <h1 className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-[#172033] sm:text-5xl lg:text-6xl">
            Discover products
            <br />
            <span className="font-medium italic text-[#40516b]">
              you'll love.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-[#5f6875] sm:text-lg">
            Explore our collection of quality products, thoughtfully selected
            for you.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-xl bg-[#172033] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#24324a] hover:shadow-md"
            >
              Shop Now
            </button>

            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-[#172033] transition-all duration-300 hover:border-[#172033] hover:bg-gray-50"
            >
              Explore Products
            </button>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 border-t border-[#D8D0C2] pt-6">

            <div className="pr-4">
              <Leaf
                size={22}
                strokeWidth={1.5}
                className="mb-2 text-[#315C4B]"
              />

              <p className="text-sm font-semibold tracking-tight text-[#172033]">
                Handcrafted
              </p>

              <p className="mt-1 text-xs leading-5 text-[#737b87]">
                Made with love
              </p>
            </div>

            <div className="border-l border-[#D8D0C2] px-4">
              <Sparkles
                size={22}
                strokeWidth={1.5}
                className="mb-2 text-[#315C4B]"
              />

              <p className="text-sm font-semibold tracking-tight text-[#172033]">
                Unique Designs
              </p>

              <p className="mt-1 text-xs leading-5 text-[#737b87]">
                For modern homes
              </p>
            </div>

            <div className="border-l border-[#D8D0C2] pl-4">
              <Gift
                size={22}
                strokeWidth={1.5}
                className="mb-2 text-[#315C4B]"
              />

              <p className="text-sm font-semibold tracking-tight text-[#172033]">
                Perfect for Gifting
              </p>

              <p className="mt-1 text-xs leading-5 text-[#737b87]">
                Make moments special
              </p>
            </div>

          </div>
        </div>

        {/* Static Hero Image */}
        <div className="relative h-[320px] overflow-hidden rounded-2xl bg-gray-200 md:h-[450px]">
          {heroImage ? (
            <img
              src={heroImage}
              alt="Resin Aura"
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                animation: "heroImageFloat 5s ease-in-out infinite",
              }}
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

          @keyframes heroImageFloat {
              0%, 100% {
                  transform: scale(1) translateY(0);
              }

              50% {
                  transform: scale(1.04) translateY(-8px);
              }
          }
        `}
      </style>
    </section>
  );
}

export default HeroSection;