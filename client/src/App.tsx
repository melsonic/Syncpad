import { useEffect } from "react";
import { Link } from "react-router-dom";
import { userLoggedInAtom } from "./atoms/user.ts";
import { accessTokenAtom } from "./atoms/accessToken.ts";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { SERVER_ADDRESS, USER_AUTHORIZE } from "./constants.ts";

export default function App() {
  const [user, setUser] = useAtom(userLoggedInAtom);
  const [accessToken, setAccessToken] = useAtom(accessTokenAtom);

  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
      return;
    }
    if (accessToken == "") {
      setAccessToken(window.localStorage.getItem("access-token") || "");
    }
    async function isAuthorize() {
      const accessTokenWithBearer = `Bearer ${accessToken}`;
      const response = await fetch(`${SERVER_ADDRESS}${USER_AUTHORIZE}`, {
        method: "GET",
        headers: {
          "Authorization": accessTokenWithBearer,
        },
      });
      if (response.status === 200) {
        setUser(true);
        navigate("/dashboard");
        return;
      }
    }
    isAuthorize();
  }, [accessToken]);

  return (
    <div className="bg-gray-100 text-gray-900 h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-500">Syncpad</h1>
          <div>
            <Link
              to="/signup"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 ml-4 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-14 text-center flex-1 flex flex-col justify-center items-center">
        <h2 className="text-4xl font-semibold mb-4">Welcome to Syncpad</h2>
        <p className="text-gray-600 py-2 text-2xl">
          Your personal, simple, and secure note-taking app.
        </p>

        <Link
          to="/signup"
          className="bg-blue-500 text-white px-6 py-3 my-4 rounded-md hover:bg-blue-600 transition"
        >
          Get Started
        </Link>
      </main>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-blue-500 text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">Simple Interface</h3>
            <p className="text-gray-600">
              Write notes effortlessly with a clean and intuitive interface.
            </p>
          </div>

          <div className="text-center">
            <div className="text-blue-500 text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">Secure Notes</h3>
            <p className="text-gray-600">
              Your notes are encrypted and secure, accessible only by you.
            </p>
          </div>

          <div className="text-center">
            <div className="text-blue-500 text-4xl mb-4">☁️</div>
            <h3 className="text-xl font-bold mb-2">Cloud Sync</h3>
            <p className="text-gray-600">
              Access your notes anytime, anywhere with cloud synchronization.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-blue-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated!</h2>
          <p className="mb-6">
            Subscribe to our newsletter and never miss an update from Syncpad.
          </p>

          <form className="flex justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full text-black md:w-1/3 p-3 rounded-l-md border-none focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-600 px-6 py-3 rounded-r-md transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-gray-200 py-6 mb-0">
        <div className="container mx-auto px-4 text-center text-gray-600">
          &copy; 2024 Syncpad. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
