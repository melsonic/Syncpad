import { useEffect, useState } from "react";
import * as constants from "../constants.ts";
import { AuthResponse } from "../types/user.tsx";
import { Link, useNavigate } from "react-router-dom";
import { userLoggedInAtom } from "../atoms/user.ts";
import { useAtom } from "jotai";

export function Login() {
  const [user, setUser] = useAtom(userLoggedInAtom);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError(new Error("Please enter both username and password"));
      return;
    }
    console.log("Login attempted with:", { username, password });
    try {
      const response: Response = await fetch(
        `${constants.SERVER_ADDRESS}${constants.USER_LOGIN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        },
      );
      if (!response.ok) {
        setUser(false);
        return;
      }
      const data: AuthResponse = await response.json();
      console.log(data["access-token"]);
      window.localStorage.setItem("access-token", data["access-token"]);
      setError(null);
      setUser(true);
    } catch (error: unknown) {
      if (typeof error === "string") {
        setError(new Error(error.toUpperCase()));
      } else if (error instanceof Error) {
        setError(new Error(error.message));
      }
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="absolute w-96 sm:w-120 py-4 px-4 mx-auto">
          <Link to="/" className="rotate-45 float-right text-lg">+</Link>
        </div>
      </div>

      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="max-w-sm mx-auto w-full flex flex-col items-center">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Welcome to the family
          </h2>
          {error && (
            <div className="absolute text-center max-w-80 sm:max-w-sm mx-auto w-full py-1 px-2 bg-red-50 border-red-300 border rounded-md my-2 mt-24 flex flex-col">
              <button
                className="rotate-45 absolute"
                onClick={() => setError(null)}
              >
                +
              </button>
              <span className="px-4">{error.message}</span>
            </div>
          )}
        </div>

        <div className="mt-24 max-w-sm mx-auto w-full">
          <form className="space-y-6" method="POST" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="text"
                  type="text"
                  required
                  autoComplete="on"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 px-2 focus:outline-gray-300"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="on"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 text-sm leading-6 px-2 focus:outline-gray-300"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Login
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?
            <Link
              to="/signup"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 pl-1"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
