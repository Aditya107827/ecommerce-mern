import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
function HeroSection() {
  const [heroImage, setHeroImage] = useState("");
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const navigate = useNavigate();

  // Fetch hero image + hero slides
  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const [settingsResponse, slidesResponse] = await Promise.all([
          api.get("/store-settings"),
          api.get("/images/hero-slides"),
        ]);

        setHeroImage(
          settingsResponse.data.heroImage?.url || ""
        );

        setHeroSlides(
          slidesResponse.data.heroSlides || []
        );
      } catch (error) {
        console.error("Failed to load hero content:", error);
      }
    };

    fetchHeroContent();
  }, []);

  // Auto slide every 5 seconds
  useEffect(() => {
    if (heroSlides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Reset slide index if slides change
  useEffect(() => {
    if (currentSlide >= heroSlides.length && heroSlides.length > 0) {
      setCurrentSlide(0);
    }
  }, [heroSlides.length, currentSlide]);

  const activeSlide = heroSlides[currentSlide];

  const handleHeroClick = () => {
    if (!activeSlide?.productId) {
      return;
    }

    navigate(`/products/${activeSlide.productId}`);
  };

  const goToPreviousSlide = (event) => {
    event.stopPropagation();

    setCurrentSlide((prev) =>
      prev === 0 ? heroSlides.length - 1 : prev - 1
    );
  };

  const goToNextSlide = (event) => {
    event.stopPropagation();

    setCurrentSlide((prev) =>
      (prev + 1) % heroSlides.length
    );
  };

  return (
    <section className="bg-gray-50">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pt-16 pb-10 md:grid-cols-2 md:pt-24 md:pb-12">

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

        {/* Hero Slider */}
        <div className="relative h-[320px] overflow-hidden rounded-2xl bg-gray-200 md:h-[450px]">

          {activeSlide?.image?.url ? (
            <button
              type="button"
              onClick={handleHeroClick}
              aria-label="View featured product"
              className="group absolute inset-0 h-full w-full cursor-pointer"
            >
              <img
                key={activeSlide._id}
                src={activeSlide.image.url}
                alt="Featured product"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </button>
          ) : heroImage ? (
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

          {/* Previous Arrow */}
          {heroSlides.length > 1 && (
            <button
              type="button"
              onClick={goToPreviousSlide}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/80"
            >
              <FiChevronLeft className="text-2xl" />
            </button>
          )}

          {/* Next Arrow */}
          {heroSlides.length > 1 && (
            <button
              type="button"
              onClick={goToNextSlide}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/80"
            >
              <FiChevronRight className="text-2xl" />
            </button>
          )}

          {/* Slider Dots */}
          {heroSlides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide._id}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={
                    index === currentSlide ? "true" : "false"
                  }
                  className={`h-2.5 rounded-full transition-all duration-300 ${index === currentSlide
                    ? "w-7 bg-white"
                    : "w-2.5 bg-white/60 hover:bg-white/90"
                    }`}
                />
              ))}
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