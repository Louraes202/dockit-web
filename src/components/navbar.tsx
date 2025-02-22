"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AuthModal } from "./authmodal";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

import { auth, app } from "@/db/firebaseConfig";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/navigation";
import { Avatar } from "./avatar";
import { signOut } from "firebase/auth";
import { CloseOutlined } from "@ant-design/icons";

type Props = {};

export const Navbar = ({}: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<string>("Home");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showUPanel, setShowUPanel] = useState<boolean>(false);
  const [showPSettings, setShowPSettings] = useState<boolean>(false);
  const [closingPSettings, setClosingPSettings] = useState<boolean>(false);
  const [showLoginWarningModal, setShowLoginWarningModal] =
    useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [modalAnimation, setModalAnimation] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const db = getFirestore(app);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Abrir o modal com fade in
  const openModal = () => {
    setModalAnimation("fade-in");
    setShowModal(true);
  };

  // Fechar o modal com fade out
  const closeModal = () => {
    setModalAnimation("fade-out");
    setTimeout(() => setShowModal(false), 300); // Tempo deve corresponder à duração da animação
  };

  const openUPanel = () => {
    setShowUPanel(true);
  };

  // Fechar o modal com fade out
  const closeUPanel = () => {
    setShowUPanel(false);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  const handleDashboard = (user: User | null) => {
    if (user) {
      router.push("/dashboard");
    } else {
      setShowLoginWarningModal(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push("/"); // Redireciona para a página inicial após logout
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handlePSettingsClose = () => {
    setClosingPSettings(true);
    setTimeout(() => {
      setShowPSettings(false);
      setClosingPSettings(false);
    }, 300); // Tempo para a animação de fade-out
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;
  
    try {
      // Define a persistência da sessão com base no rememberMe
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
        // Adicionar username no Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          username: (user !== null) ? user.email?.split("@")[0] : "",
          email: (user !== null) ? user.email : "",
        });
      }
      setUser(userCredential.user);
      closeModal();
      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage = err.message.replace(/Firebase: /i, "");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {" "}
      {/* Large menu*/}
      <div className="">
        <nav className="relative px-4 py-4 flex justify-between items-center bg-transparent">
          <a className="text-3xl font-bold leading-none" href="#">
            <Image src="/dockit_logo.png" alt="logo" width={100} height={30} />
          </a>
          <div className="lg:hidden">
            <button
              className="navbar-burger flex items-center text-blue-600 p-3"
              onClick={toggleMenu}
            >
              <svg
                className="block h-4 w-4 fill-current"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Mobile menu</title>
                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
              </svg>
            </button>
          </div>
          <ul className="hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 lg:flex lg:mx-auto lg:items-center lg:w-auto lg:space-x-8">
            {["Home", "About", "Features", "Pricing", "Contact"].map((item) => (
              <li
                key={item}
                className={`text-sm ${
                  activeItem === item
                    ? "text-blue-600 font-bold transition duration-200"
                    : "text-gray-400 hover:text-gray-500 transition duration-200"
                }`}
              >
                <a href="#" onClick={() => handleItemClick(item)}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
          {user ? (
            <div className="hidden lg:inline-block lg:ml-auto lg:mr-3 py-1 px-4 text-sm text-white font-bold transition duration-200">
              <a
                href="#"
                onClick={() => {
                  setShowUPanel(!showUPanel);
                }}
              >
                {user.email?.split("@")[0]}
              </a>
              {showPSettings && (
                <div
                  className={`absolute mt-2 ${
                    closingPSettings ? "fade-out" : "fade-in"
                  }`}
                >
                  <div
                    id="tooltip-bottom"
                    role="tooltip"
                    className="relative z-10 flex-row px-5 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-100"
                    style={{ transform: "translateX(-50%)" }}
                  >
                    <button
                      onClick={handlePSettingsClose} // Função para fechar o tooltip
                      className="absolute top-2 right-2 text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-6 h-6 flex items-center justify-center"
                    >
                      <CloseOutlined />
                    </button>
                    You can change your profile details on the dashboard.
                    <div className="tooltip-arrow" data-popper-arrow></div>
                  </div>
                </div>
              )}
              {showUPanel && (
                <Avatar
                  userName={user.email?.split("@")[0]}
                  userEmail={user.email ? user.email : "Not found"}
                  onSignOut={handleSignOut}
                />
              )}
            </div>
          ) : (
            <a
              className="hidden lg:inline-block lg:ml-auto lg:mr-3 py-1 px-4 text-sm text-white hover:text-blue-500 font-bold transition duration-200"
              href="#"
              onClick={() => openModal()}
              type="button"
            >
              Sign In
            </a>
          )}
          <a
            className="hidden lg:inline-block py-1 px-4 bg-gray-50 text-sm text-gray-900 hover:text-white hover:bg-blue-500 font-bold rounded-xl transition duration-200"
            onClick={() => handleDashboard(user)}
            href="#"
          >
            Dashboard
          </a>
        </nav>{" "}
        {/* Auth Modal */}
        {showModal && (
          <div
            className={`modal-backdrop ${modalAnimation}`}
            onClick={closeModal}
          >
            <div
              id="auth-modal"
              tabIndex={-1}
              className={`relative w-full max-w-md max-h-full bg-white rounded-lg shadow dark:bg-gray-700 ${modalAnimation}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-2 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                  <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Sign in to our platform
                    </h3>
                    <button
                      type="button"
                      className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={() => closeModal()}
                    >
                      <svg
                        className="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                      </svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                  </div>
                  <div className="p-4 md:p-5">
                    <form
                      className="space-y-4 transition duration-100"
                      action="#"
                      onSubmit={handleSubmit}
                    >
                      <div>
                        <label
                          htmlFor="email"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Your email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                          placeholder="name@company.com"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="password"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Your password
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          placeholder="••••••••"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                          required
                        />
                      </div>
                      {!isLogin && (
                        <div>
                          <label
                            htmlFor="confirm-password"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Confirm your password
                          </label>
                          <input
                            type="password"
                            name="confirm-password"
                            id="confirm-password"
                            placeholder="••••••••"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      )}
                      <div className="flex justify-between">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="remember"
                              type="checkbox"
                              value=""
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                            />
                          </div>
                          <label
                            htmlFor="remember"
                            className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                          >
                            Remember me
                          </label>
                        </div>
                        {isLogin && (
                          <a
                            href="#"
                            className="text-sm text-blue-700 hover:underline dark:text-blue-500"
                          >
                            Lost Password?
                          </a>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        {isLogin
                          ? "Login to your account"
                          : "Create your account"}
                      </button>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                        {isLogin ? (
                          <>
                            Not registered?{" "}
                            <a
                              href="#"
                              onClick={toggleForm}
                              className="text-blue-700 hover:underline dark:text-blue-500"
                            >
                              Create account
                            </a>
                          </>
                        ) : (
                          <>
                            Already have an account?{" "}
                            <a
                              href="#"
                              onClick={toggleForm}
                              className="text-blue-700 hover:underline dark:text-blue-500"
                            >
                              Login
                            </a>
                          </>
                        )}
                      </div>
                    </form>
                    {loading && (
                      <div className="flex items-center justify-center mt-4">
                        <Spinner aria-label="Loading spinner" size="lg" />
                        <span className="ml-2">Loading...</span>
                      </div>
                    )}
                    {error && <div className="text-red-500 mt-2">{error}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Login warning modal */}
        <div
          id="login-warning-modal"
          className={`fixed inset-0 z-50 flex items-center justify-center w-full h-full ${
            showLoginWarningModal ? "" : "hidden"
          } fade-in`}
        >
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setShowLoginWarningModal(false)}
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                <svg
                  className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  You need to log in to access the dashboard.
                </h3>
                <button
                  onClick={() => {
                    setShowLoginWarningModal(false);
                    openModal();
                  }}
                  className="text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                >
                  Log In
                </button>
                <button
                  onClick={() => setShowLoginWarningModal(false)}
                  className="py-2.5 px-5 ml-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="navbar-menu relative z-50">
            <div className="navbar-backdrop fixed inset-0 bg-gray-800 opacity-25"></div>
            <nav className="fixed top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm py-6 px-6 bg-gray-800 overflow-y-auto">
              <div className="flex items-center mb-8">
                <a className="mr-auto text-3xl font-bold leading-none" href="#">
                  <Image
                    src="/dockit_logo.png"
                    alt="logo"
                    width={48}
                    height={48}
                  />
                </a>
                <button className="navbar-close" onClick={toggleMenu}>
                  <svg
                    className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
              <div>
                <ul>
                  {["Home", "About", "Features", "Pricing", "Contact"].map(
                    (item) => (
                      <li key={item} className="mb-1">
                        <a
                          className={`block p-4 text-sm font-semibold rounded ${
                            activeItem === item
                              ? "bg-gray-900 text-white"
                              : "text-gray-400 hover:bg-blue-50 hover:text-black"
                          }`}
                          href="#"
                          onClick={() => handleItemClick(item)}
                        >
                          {item}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="mt-auto">
                <div className="pt-6">
                  <a
                    className="block px-4 py-2 mb-3 leading-loose text-xs text-center font-semibold bg-gray-900 hover:bg-white hover:text-black rounded-xl"
                    href="#"
                    onClick={toggleMenu}
                  >
                    Sign in
                  </a>
                  <a
                    className="block px-4 py-3 mb-2 leading-loose text-xs text-center text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl"
                    href="#"
                    onClick={toggleMenu}
                  >
                    Dashboard
                  </a>
                </div>
                <p className="my-4 text-xs text-center text-gray-400">
                  <span>Copyright © 2021</span>
                </p>
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};
