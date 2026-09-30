import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";

function HeroSlider() {
    const [heroSlides, setHeroSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const navigate = useNavigate();

    // Fetch hero slides
    useEffect(() => {
        const fetchHeroSlides = async () => {
            try {
                const response = await api.get("/images/hero-slides");

                setHeroSlides(
                    response.data.heroSlides || []
                );
            } catch (error) {
                console.error(
                    "Failed to load hero slides:",
                    error
                );
            }
        };

        fetchHeroSlides();
    }, []);

    // Auto slide every 5 seconds
    useEffect(() => {
        if (heroSlides.length <= 1) {
            return;
        }

        const interval = setInterval(() => {
            setCurrentSlide(
                (prev) =>
                    (prev + 1) % heroSlides.length
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [heroSlides.length]);

    // Reset slide index if slides change
    useEffect(() => {
        if (
            currentSlide >= heroSlides.length &&
            heroSlides.length > 0
        ) {
            setCurrentSlide(0);
        }
    }, [heroSlides.length, currentSlide]);

    const activeSlide = heroSlides[currentSlide];

    const handleHeroClick = () => {
        if (!activeSlide?.productId) {
            return;
        }

        navigate(
            `/products/${activeSlide.productId}`
        );
    };

    const goToPreviousSlide = (event) => {
        event.stopPropagation();

        setCurrentSlide((prev) =>
            prev === 0
                ? heroSlides.length - 1
                : prev - 1
        );
    };

    const goToNextSlide = (event) => {
        event.stopPropagation();

        setCurrentSlide(
            (prev) =>
                (prev + 1) % heroSlides.length
        );
    };

    // Don't render slider if there are no slides
    if (!activeSlide?.image?.url) {
        return null;
    }

    return (
        <section className="w-full bg-gray-50">
            <div className="relative w-full overflow-hidden">
                <button
                    type="button"
                    onClick={handleHeroClick}
                    aria-label="View featured product"
                    className="group block h-[270px] w-full cursor-pointer sm:h-[320px] md:h-[385px] lg:h-[440px]"
                >
                    <img
                        key={activeSlide._id}
                        src={activeSlide.image.url}
                        alt="Featured product"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                    />
                </button>

                {/* Previous Arrow */}
                {heroSlides.length > 1 && (
                    <button
                        type="button"
                        onClick={goToPreviousSlide}
                        aria-label="Previous slide"
                        className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/80 sm:left-6 sm:h-11 sm:w-11"
                    >
                        <FiChevronLeft className="text-xl sm:text-2xl" />
                    </button>
                )}

                {/* Next Arrow */}
                {heroSlides.length > 1 && (
                    <button
                        type="button"
                        onClick={goToNextSlide}
                        aria-label="Next slide"
                        className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/80 sm:right-6 sm:h-11 sm:w-11"
                    >
                        <FiChevronRight className="text-xl sm:text-2xl" />
                    </button>
                )}

                {/* Slider Dots */}
                {heroSlides.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                        {heroSlides.map((slide, index) => (
                            <button
                                key={slide._id}
                                type="button"
                                onClick={() =>
                                    setCurrentSlide(index)
                                }
                                aria-label={`Go to slide ${index + 1
                                    }`}
                                aria-current={
                                    index === currentSlide
                                        ? "true"
                                        : "false"
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
        </section>
    );
}

export default HeroSlider;