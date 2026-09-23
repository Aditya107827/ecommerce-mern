import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
function MainLayout(){
    return(
        <div className="min-h-screen flex flex-col">
            {/*Navbar*/}
            <Navbar/>

            <main className="flex-1">
                <Outlet/>
            </main>
            {/*Footer*/}
            <Footer/>
        </div>
    )
}


export default MainLayout;