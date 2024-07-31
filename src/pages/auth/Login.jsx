import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logoLp3i from "../../assets/img/logo-lp3i.png";
import logoTagline from "../../assets/img/tagline-warna.png";
import {
  checkTokenExpiration,
  forbiddenAccess,
} from "../../middlewares/middleware";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);


  const navigate = useNavigate();

  const loginFunc = async (e) => {
    e.preventDefault();
    setLoading(true);
    await axios
      .post(
        `https://database.politekniklp3i-tasikmalaya.ac.id/api/auth/psikotest/login`,
        {
          email: email,
          password: password,
        }
      )
      .then((response) => {
        console.log(response.data);
        localStorage.setItem("token", response.data.access_token);
        alert(response.data.message);
        navigate("/home");
        setLoading(false); // Reset loading state
      })
      .catch((error) => {
        setLoading(false); // Reset loading state
        if (error.response.status == 401) {
          return alert(error.response.data.message);
        } else {
          console.log(error);
        }
      });
  };
  

  useEffect(() => {
    checkTokenExpiration()
      .then(() => {
        window.history.back();
      })
      .catch((error) => {
        console.log(error);
      });
    forbiddenAccess()
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <section className="bg-gray-50 h-screen flex justify-center items-center bg-cover">
      <main className="container mx-auto space-y-8 px-5">
        <div className="max-w-md mx-auto flex justify-center gap-5">
          <img src={logoLp3i} alt="logo lp3i" className="h-14" />
          <img src={logoTagline} alt="logo lp3i" className="h-12" />
        </div>
        <form
          className="max-w-md bg-white border border-gray-100 shadow-lg mx-auto px-8 py-8 rounded-3xl"
          onSubmit={loginFunc}
        >
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-50 border font-reguler border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="name@email.com"
              required
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            />
          </div>
          <div className="space-x-3">
            <button
              type="submit"
              className={`text-white bg-blue-700 ${
                isInvalid || loading ? "bg-red-500" : "hover:bg-blue-800"
              } focus:ring-4 focus:outline-none focus:ring-blue-300 font-reguler rounded-xl text-sm w-full sm:w-auto px-5 py-2.5 text-center`}
            >
              {
              loading ? (
                <div role="status" className="flex items-center justify-center">
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 text-center text-gray-200 animate-spin fill-white"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <span>Masuk</span>
              )}
            </button>
            <a
              href={`/register`}
              className="text-sm text-gray-700 hover:underline"
            >
              <span>Belum punya akun? </span>
              <span className="font-medium">Daftar disini</span>
            </a>
          </div>
        </form>
      </main>
    </section>
  );
};

export default Login;
