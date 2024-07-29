import { useState, useEffect } from "react";
import backgroundImage from "../assets/img/background.png";
import Lottie from "lottie-react";
import questionImage from "../assets/img/awan-lp3i.json";
import { checkTokenExpiration } from "../middlewares/middleware";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Result = () => {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  const getUser = async () => {
    checkTokenExpiration()
      .then(() => {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);

        const userId = decoded.id;
        const userName = decoded.name;
        const userEmail = decoded.email;
        const userPhone = decoded.phone;
        const userStatus = decoded.status;

        const data = {
          id: userId,
          name: userName,
          email: userEmail,
          phone: userPhone,
          status: userStatus,
        };

        setUser(data);
        getResult(data);
      })
      .catch((error) => {
        console.log(error);
        navigate("/");
      });
  };

  const getResult = async (data) => {
    await axios
      .get(`http://localhost:3000/hasils/${data.id}`)
      .then((response) => {
        const data = response.data;

        if (data.length == 0) {
          return navigate("/home");
        }
        const resultOne = response.data[0];
        const resultTwo = response.data[1];
        setResult(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const logoutFunc = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("bucket");
    navigate("/");
  };

  useEffect(() => {
    checkTokenExpiration()
      .then(() => {
        getUser();
      })
      .catch((error) => {
        console.log(error);
        navigate("/");
      });
  }, []);

  const mainStyle = {
    position: "relative",
    overflowX: "hidden", // Prevent horizontal scrolling
    overflowY: "auto", // Allow vertical scrolling if needed
  };

  const backgroundImageStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "repeat",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -2,
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(212, 212, 212, 0.5)",
    zIndex: -1,
  };
  return (
    <main
      style={mainStyle}
      className="flex flex-col p-5 md:p-20 items-center justify-center h-screen"
    >
      <div style={backgroundImageStyle}></div>
      <div style={overlayStyle}></div>
      <div>
        <Lottie animationData={questionImage} loop={true} className="h-40" />
      </div>
      <div className="bg-white shadow-xl p-4 text-center rounded-3xl">
        <div className="font-bold text-[30px] my-2">{user.name}</div>
        <hr className="border boreder-2 my-4 mx-4" />

        {result ? (
          <div className="text-2xl text-black uppercase font-bold" id="result">
            {result[0].hasil === "VISUAL" ? (
              <div className="p-4 normal-case text-md text-sm text-slate-700">
                Selamat, Gaya Belajar Kamu
                <span className="text-red-500 font-extrabold uppercase pl-1">
                  VISUAL
                </span>
                .<br></br>
                <br></br>Seseorang dengan gaya belajar{" "}
                <span className="text-red-500 font-extrabold uppercase pl-1 pl-1">
                  VISUAL
                </span>{" "}
                memiliki kecenderungan untuk hal-hal dilihat atau diamati,
                termasuk film gambar, diagram, demonstrasi, display, handout,
                flip-chart, dll. Orang-orang ini akan menggunakan frase seperti,{" "}
                <span className="font-bold">tunjukan padaku</span>{" "}
                <span className="font-bold">mari kita lihat</span> dan akan
                mampu melakukan tugas baru setelah membaca petunjuk atau
                menonton orang lain melakukannya terlebih dahulu. Ini adalah
                orang-orang yang akan bekerja berdasarkan daftar dan instruksi
                tertulis
              </div>
            ) : result[0].hasil === "AUDITORY" ? (
              <div className="p-4 normal-case text-md text-sm text-slate-700">
                Selamat, Gaya Belajar Kamu
                <span className="text-red-500 font-extrabold uppercase pl-1 pl-1">
                  AUDITORY
                </span>
                .<br></br>
                <br></br>Seseorang dengan gaya belajar{" "}
                <span className="text-red-500 font-extrabold uppercase pl-1 pl-1">
                  AUDITORY
                </span>{" "}
                memiliki kecenderungan untuk mentransfer informasi melalui
                mendengarkan: dengan kata yang diucapkan, suara diri sendiri
                atau orang lain, dan suara. Orang-orang ini akan menggunakan
                frase seperti{" "}
                <span className="font-bold">katakan pada saya</span>,{" "}
                <span className="font-bold">mari kita bicara</span> dan akan
                paling mampu melakukan tugas baru setelah mendengarkan dengan
                bimbingan dari para ahli. Ini adalah orang-orang yang mencintai
                harus diinstruksikan untuk berbicara melalui telepon, dan dapat
                mengingat semua kata-kata untuk lagu-lagu yang mereka dengarkan.
              </div>
            ) : result[0].hasil === "KINESTETIK" ? (
              <div className="p-4 normal-case text-md text-sm text-slate-700">
                Selamat, Gaya Belajar Kamu
                <span className="text-red-500 font-extrabold uppercase pl-1">
                  KINESTETIK
                </span>
                .<br></br>
                <br></br>Seseorang dengan gaya belajar{" "}
                <span className="text-red-500 font-extrabold uppercase pl-1 pl-1">
                  KINESTETIK
                </span>{" "}
                memiliki kecenderungan untuk pengalaman fisik - menyentuh,
                merasa, memegang, melakukan, praktis pengalaman. Orang-orang ini
                akan menggunakan frase seperti <span>biarkan saya coba</span>,{" "}
                <span>bagaimana perasaan Anda?</span> Dan akan lebih baik dapat
                melakukan tugas baru dengan terus mencoba, terus belajar dambil
                melakukan. Ini adalah orang yang suka melakukan eksperimen,
                langsung mencoba, dan tidak pernah membaca instruksi dulu.
              </div>
            ) : result[0].hasil === "VISUAL and AUDITORY" ? (
              <div className="p-4 normal-case text-md text-sm text-slate-700">
                Selamat, Gaya Belajar Kamu
                <span className="text-red-500 font-extrabold uppercase pl-1">
                  VISUAL dan AUDITORY
                </span>
                .<br></br>
                <br></br>Seseorang dengan gaya belajar{" "}
                <span className="text-red-500 font-extrabold uppercase pl-1 pl-1">
                  VISUAL
                </span>{" "}
                memiliki kecenderungan untuk hal-hal dilihat atau diamati,
                termasuk film gambar, diagram, demonstrasi, display, handout,
                flip-chart, dll. Orang-orang ini akan menggunakan frase seperti,{" "}
                <span className="font-bold">tunjukan padaku</span>{" "}
                <span className="font-bold">mari kita lihat</span> dan akan
                mampu melakukan tugas baru setelah membaca petunjuk atau
                menonton orang lain melakukannya terlebih dahulu. Ini adalah
                orang-orang yang akan bekerja berdasarkan daftar dan instruksi
                tertulis.
                <br></br>
                <br></br>
                <span className="text-red-500 font-extrabold uppercase pl-1 pl-1">
                  AUDITORY
                </span>{" "}
                memiliki kecenderungan untuk mentransfer informasi melalui
                mendengarkan: dengan kata yang diucapkan, suara diri sendiri
                atau orang lain, dan suara. Orang-orang ini akan menggunakan
                frase seperti{" "}
                <span className="font-bold">katakan pada saya</span>,{" "}
                <span className="font-bold">mari kita bicara</span> dan akan
                paling mampu melakukan tugas baru setelah mendengarkan dengan
                bimbingan dari para ahli. Ini adalah orang-orang yang mencintai
                harus diinstruksikan untuk berbicara melalui telepon, dan dapat
                mengingat semua kata-kata untuk lagu-lagu yang mereka dengarkan.
              </div>
            ) : result[0].hasil === "VISUAL and KINESTETIK" ? (
              <div className="p-4 normal-case text-md text-sm text-slate-700">
                Selamat, Gaya Belajar Kamu
                <span className="text-red-500 font-extrabold uppercase pl-1">
                  VISUAL dan KINESTETIK
                </span>
                .<br></br>
                <br></br>Seseorang dengan gaya belajar{" "}
                <span className="text-red-500 font-extrabold uppercase pl-1 pl-1">
                  VISUAL
                </span>{" "}
                memiliki kecenderungan untuk hal-hal dilihat atau diamati,
                termasuk film gambar, diagram, demonstrasi, display, handout,
                flip-chart, dll. Orang-orang ini akan menggunakan frase seperti,{" "}
                <span className="font-bold">tunjukan padaku</span>{" "}
                <span className="font-bold">mari kita lihat</span> dan akan
                mampu melakukan tugas baru setelah membaca petunjuk atau
                menonton orang lain melakukannya terlebih dahulu. Ini adalah
                orang-orang yang akan bekerja berdasarkan daftar dan instruksi
                tertulis.
                <br></br>
                <br></br>
                <span className="text-red-500 font-extrabold uppercase pl-1 pl-1">
                  KINESTETIK
                </span>{" "}
                memiliki kecenderungan untuk pengalaman fisik - menyentuh,
                merasa, memegang, melakukan, praktis pengalaman. Orang-orang ini
                akan menggunakan frase seperti <span>biarkan saya coba</span>,{" "}
                <span>bagaimana perasaan Anda?</span> Dan akan lebih baik dapat
                melakukan tugas baru dengan terus mencoba, terus belajar dambil
                melakukan. Ini adalah orang yang suka melakukan eksperimen,
                langsung mencoba, dan tidak pernah membaca instruksi dulu.
              </div>
            ) : result[0].hasil === "AUDITORY and KINESTETIK" ? (
              <div className="p-4 normal-case text-md text-sm text-slate-700">
                Selamat, Gaya Belajar Kamu
                <span className="text-red-500 font-extrabold uppercase pl-1">
                  AUDITORY dan KINESTETIK
                </span>
                .<br></br>
                <br></br>Seseorang dengan gaya belajar{" "}
                <span className="text-red-500 font-extrabold uppercase pl-1 pl-1">
                  AUDITORY
                </span>{" "}
                memiliki kecenderungan untuk mentransfer informasi melalui
                mendengarkan: dengan kata yang diucapkan, suara diri sendiri
                atau orang lain, dan suara. Orang-orang ini akan menggunakan
                frase seperti{" "}
                <span className="font-bold">katakan pada saya</span>,{" "}
                <span className="font-bold">mari kita bicara</span> dan akan
                paling mampu melakukan tugas baru setelah mendengarkan dengan
                bimbingan dari para ahli. Ini adalah orang-orang yang mencintai
                harus diinstruksikan untuk berbicara melalui telepon, dan dapat
                mengingat semua kata-kata untuk lagu-lagu yang mereka dengarkan.
                <br></br>
                <br></br>
                <span className="text-red-500 font-extrabold uppercase pl-1 pl-1">
                  KINESTETIK
                </span>{" "}
                memiliki kecenderungan untuk pengalaman fisik - menyentuh,
                merasa, memegang, melakukan, praktis pengalaman. Orang-orang ini
                akan menggunakan frase seperti <span>biarkan saya coba</span>,{" "}
                <span>bagaimana perasaan Anda?</span> Dan akan lebih baik dapat
                melakukan tugas baru dengan terus mencoba, terus belajar dambil
                melakukan. Ini adalah orang yang suka melakukan eksperimen,
                langsung mencoba, dan tidak pernah membaca instruksi dulu.
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-black">Loading..</p>
        )}
        <button
          type="button"
          onClick={logoutFunc}
          className="bg-sky-700 hover:bg-sky-800 text-white px-5 py-2 rounded-xl text-sm"
        >
          <i className="fa-solid fa-right-from-bracket"></i> Keluar
        </button>
      </div>
    </main>
  );
};

export default Result;