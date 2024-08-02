import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import axios from "axios";
import {
  checkTokenExpiration,
  forbiddenAccess,
} from "../../middlewares/middleware";
import "../../assets/css/select-react.css";
import logoLp3i from "../../assets/img/logo-lp3i.png";
import logoTagline from "../../assets/img/tagline-warna.png";

const Register = () => {
  const [nameReg, setNameReg] = useState("");
  const [emailReg, setEmailReg] = useState("");
  const [schoolReg, setSchoolReg] = useState("");
  const [classReg, setClassReg] = useState("");
  const [phoneReg, setPhoneReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [passwordConfReg, setPasswordConfReg] = useState("");

  const [errorsName, setErrorsName] = useState([]);
  const [errorsSchool, setErrorsSchool] = useState([]);
  const [errorsClasses, setErrorsClasses] = useState([]);
  const [errorsEmail, setErrorsEmail] = useState([]);
  const [errorsPhone, setErrorsPhone] = useState([]);
  const [errorsPassword, setErrorsPassword] = useState([]);

  const [selectedSchool, setSelectedSchool] = useState(null);

  const [schoolsAPI, setSchoolsAPI] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    let inputValue = e.target.value;
    const numericInput = inputValue.replace(/\D/g, "");
    const maxLength = 14;
    const truncatedInput = numericInput.slice(0, maxLength);

    let formattedValue = "";
    if (truncatedInput.length > 0) {
      formattedValue = "62";
      for (let i = 2; i < truncatedInput.length; i++) {
        if (i === 2 && truncatedInput[i] !== "8") {
          formattedValue += "8";
        } else {
          formattedValue += truncatedInput[i];
        }
      }
    }

    setIsInvalid(truncatedInput.length < 11);
    setPhoneReg(formattedValue);
  };

  const getSchools = async () => {
    await axios
      .get(
        `https://database.politekniklp3i-tasikmalaya.ac.id/api/school/getall`
      )
      .then((res) => {
        let bucket = [];
        let dataSchools = res.data.schools;
        dataSchools.forEach((data) => {
          bucket.push({
            value: data.id,
            label: data.name,
          });
        });
        setSchoolsAPI(bucket);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const schoolHandle = (selectedOption) => {
    if (selectedOption) {
      console.log(selectedOption);
      setSchoolReg(selectedOption);
      setSelectedSchool(selectedOption);
    }
  };

  const registerFunc = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      name: nameReg,
      school: schoolReg,
      classes: classReg,
      email: emailReg,
      phone: phoneReg,
      password: passwordReg,
      password_confirmation: passwordConfReg,
    };
    console.log(data);
    await axios
      .post(
        `https://database.politekniklp3i-tasikmalaya.ac.id/api/auth/psikotest/register`,
        data
      )
      .then((response) => {
        alert(response.data.message);
        navigate("/");
        setLoading(false);
      })
      .catch((error) => {
        const errorCustom = error.response.data.message;
        setErrorsName(errorCustom.name);
        setErrorsSchool(errorCustom.school);
        setErrorsClasses(errorCustom.classes);
        setErrorsEmail(errorCustom.email);
        setErrorsPhone(errorCustom.phone);
        setErrorsPassword(errorCustom.password);
        setLoading(false);
      });
  };

  useEffect(() => {
    checkTokenExpiration()
      .then(() => {
        window.history.back();
      })
      .catch(() => {
        getSchools();
      });
  }, []);

  return (
    <section className="bg-gray-50 h-screen flex justify-center items-center bg-cover">
      <main className="container mx-auto space-y-8 px-5">
        <div className="max-w-xl mx-auto flex justify-center gap-5">
          <img src={logoLp3i} alt="logo lp3i" className="h-14" />
          <img src={logoTagline} alt="logo lp3i" className="h-12" />
        </div>
        <form
          className="max-w-2xl bg-white border border-gray-100 shadow-lg mx-auto px-8 py-8 space-y-5 rounded-3xl"
          onSubmit={registerFunc}
        >
          <div className="grid grid-cols-1">
            <div>
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                id="name"
                value={nameReg}
                onChange={(e) => setNameReg(e.target.value)}
                className="bg-gray-50 border font-reguler border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Isi nama lengkap"
                required
              />
              <small className="text-xs text-red-600">{errorsName}</small>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="">
              <label
                htmlFor="classes"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Kelas
              </label>
              <select
                id="clasess"
                onChange={(e) => setClassReg(e.target.value)}
                className="bg-gray-50 border font-reguler border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                data-placeholder="Nabil"
                required
              >
                <option value="">Pilih</option>
                <option value="X TKR 1">X TKR 1</option>
                <option value="X TKR 2">X TKR 2</option>
                <option value="X TKR 3">X TKR 3</option>
                <option value="X TSM 1">X TSM 1</option>
                <option value="X TSM 2">X TSM 2</option>
                <option value="X TSM 3">X TSM 3</option>
                <option value="X TSM 4">X TSM 4</option>
                <option value="X RPL 1">X RPL 1</option>
                <option value="X RPL 2">X RPL 2</option>
                <option value="X RPL 3">X RPL 3</option>
              </select>
              <small className="text-xs text-red-600">{errorsClasses}</small>
            </div>
            <div>
              <div>
                <label
                  htmlFor="school"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Sekolah
                </label>
                <CreatableSelect type="text" id="school" styles={{ fontFamily: 'Rubik' }} options={schoolsAPI} value={selectedSchool} onChange={schoolHandle} placeholder='Sekolah' required />

                
                <small className="text-xs text-red-600">{errorsSchool}</small>
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={emailReg}
                onChange={(e) => setEmailReg(e.target.value)}
                className="bg-gray-50 border font-reguler border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="name@email.com"
                required
              />
              <small className="text-xs text-red-600">{errorsEmail}</small>
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                No. Telpon
              </label>
              <input
                type="number"
                id="phone"
                value={phoneReg}
                onChange={handlePhoneChange}
                className={`bg-gray-50 border font-reguler border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 `}
                placeholder="6281313608558"
                required
              />
              {isInvalid && (
                <small className="text-red-500 text-sm">
                  Minimal 11 Karakter.
                </small>
              )}
              <small className="text-xs text-red-600">{errorsPhone}</small>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={passwordReg}
                onChange={(e) => setPasswordReg(e.target.value)}
                className="bg-gray-50 border font-reguler border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>
            <div>
              <label
                htmlFor="passwordConf"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Konfirmasi Password
              </label>
              <input
                type="password"
                id="passwordConf"
                value={passwordConfReg}
                onChange={(e) => setPasswordConfReg(e.target.value)}
                className="bg-gray-50 border font-reguler border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
              <small className="text-xs text-red-600">{errorsPassword}</small>
            </div>
          </div>
          <div className="space-x-3">
            <button
              type="submit"
              disabled={isInvalid || loading}
              className={`text-white bg-blue-700 ${
                isInvalid || loading ? "bg-red-500" : "hover:bg-blue-800"
              } focus:ring-4 focus:outline-none focus:ring-blue-300 font-reguler rounded-xl text-sm w-full sm:w-auto px-5 py-2.5 text-center`}
            >
              {
                  loading ? (
                    <div role="status" className="flex items-center justify-center">
                      <svg aria-hidden="true" className="w-4 h-4 text-center text-gray-200 animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                  ) : (
                    <span>Daftar</span>
                  )
                }
            </button>
            <a href={`/`} className="text-sm text-gray-700 hover:underline">
              <span>Sudah punya akun? </span>
              <span className="font-medium">Masuk disini</span>
            </a>
          </div>
        </form>
      </main>
    </section>
  );
};

export default Register;
