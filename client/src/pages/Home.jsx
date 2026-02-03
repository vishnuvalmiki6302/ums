import Dash from "../components/Dash"
import Header from "../components/Header"
import Navbar from "../components/Navbar"
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Home = () => {
  const { userData, backendUrl, setUserData, setIsLoggedin, getUserData } = useContext(AppContext);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center">
      <Navbar/>
      {/* <Header/> */}
      <Dash
      userData={userData}
      backendUrl={backendUrl}
      setUserData={setUserData}
      setIsLoggedin={setIsLoggedin}
      getUserData={getUserData}
    />
    </div>
  )
}

export default Home
