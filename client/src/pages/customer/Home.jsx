import HeroSlider from "../../components/home/HeroSlider";
import HeroSection from "../../components/home/HeroSection";
import CategorySection from "../../components/home/CategorySection";
import FeaturedProducts from "../../components/home/FeaturedProducts";
import WhyShopWithUs from "../../components/home/WhyShopWithUs";
function Home() {
    return (
        <>
            <HeroSlider />
            <HeroSection />
            <CategorySection/>
            <FeaturedProducts/>
            <WhyShopWithUs />
        </>
    )
}

export default Home;