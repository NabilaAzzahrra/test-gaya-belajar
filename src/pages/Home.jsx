/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import awanLp3i from "../assets/img/awan-lp3i.json";
import logoLp3i from "../assets/img/logo-lp3i.png";

import logoTagline from "../assets/img/tagline-warna.png";
import { checkTokenExpiration } from "../middlewares/middleware";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const [user, setUser] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(true);
  // const [jurusan, setJurusan] = useState('belum ada');
  const navigate = useNavigate();

  const getUser = async () => {
    checkTokenExpiration()
      .then(() => {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);

        const userId = decoded.id;
        const userName = decoded.name;
        const userEmail = decoded.email;
        const userPhone = decoded.phone;
        const userSchool = decoded.school ?? "Tidak diketahui";
        const userClasses = decoded.class ?? "Tidak diketahui";
        const userStatus = decoded.status;

        const data = {
          id: userId,
          name: userName,
          email: userEmail,
          phone: userPhone,
          school: userSchool,
          classes: userClasses,
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
      .get(
        `http://localhost:3000/hasils/${data.id}`
      )
      .then((response) => {
        const data = response.data;
        setResult(data);

        if (data.length == 0) {
          setLoading(false);
          setError(false);
        } else {
          const resultOne = response.data[0];
          const resultTwo = response.data[1];

          const jurusanOne = resultOne.jurusan.split(",");
          const jurusanTwo = resultTwo.jurusan.split(",");

          if (jurusanOne.length == 1 && jurusanTwo.length == 1) {
            setJurusan(resultOne.jurusan);
          } else if (jurusanOne.length == 1 || jurusanTwo.length == 1) {
            if (jurusanOne.length == 1) {
              setJurusan(jurusanOne[0]);
            }
            if (jurusanTwo.length == 1) {
              setJurusan(jurusanTwo[0]);
            }
          } else {
            let hasil = [];
            for (const jurusan of jurusanOne) {
              if (jurusanTwo.includes(jurusan)) {
                hasil.push(jurusan);
              }
            }
            setJurusan(hasil[0]);
          }
          setLoading(false);
          setError(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setError(false);
        setLoading(false);
      });
  };

  const logoutFunc = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("bucket");
    navigate("/");
  };

  const startTest = async () => {
    console.log("start");
    try {
      const responseUserExist = await axios.get(
        `http://localhost:3000/users/${user.id}`
      );
      if (responseUserExist.data) {
        navigate("/question");
      } else {
        const data = {
          id_user: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          school: user.school,
          classes: user.classes,
        };
        await axios
          .post(
            `http://localhost:3000/users`,
            data
          )
          .then(() => {
            navigate("/question");
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkTokenExpiration()
      .then(() => {
        getUser();
      })
      .catch(() => {
        navigate("/");
      });
  }, []);

  return (
    <section className="bg-white h-screen relative bg-cover">
      <main className="container mx-auto flex flex-col justify-center items-center h-screen px-5 gap-5">
        <div className="flex justify-between gap-5">
          <img src={logoLp3i} alt="logo lp3i" className="h-14" />
          <img src={logoTagline} alt="logo lp3i" className="h-12" />
        </div>
        <div className="">
          <Lottie animationData={awanLp3i} loop={true} className="h-52" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="uppercase font-bold text-3xl">Tes Gaya Belajar</h2>
          <p className="text-sm">
            kebanyakan orang cenderung memiliki satu gaya belajar utama namun
            seringkali menggunakan beberapa gaya secara bersamaan. Mengetahui
            gaya belajar Anda dapat membantu Anda memilih metode belajar yang
            paling efektif.
          </p>
        </div>
        {loading ? (
          <p className="text-gray-900 text-sm">Loading...</p>
        ) : error ? (
          <div className="text-center space-y-3">
            <div className="border-2 border-red-500 text-base bg-red-500 rounded-xl text-white px-5 py-3">
              <p>Mohon maaf, server sedang tidak tersedia.</p>
            </div>
            <button
              type="button"
              onClick={logoutFunc}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm"
            >
              <i className="fa-solid fa-right-from-bracket"></i> Keluar
            </button>
          </div>
        ) : result.length > 0 ? (
          <div className="text-center space-y-3">
            <div className="border-2 border-gray-900 text-base px-5 py-3">
              <p>
                <span>Nama Lengkap: </span>
                <span className="font-bold underline">{user.name}</span>
              </p>
              <p>
                <span>Gaya Belajar Anda: </span>
                <span className="font-bold underline">
                  <span>{result[0].hasil}</span>
                  {/* <span> & </span>
                                                <span>{result[1].jenis_kecerdasan}</span> */}
                </span>
              </p>
              {/* <p>
                                            <span>Jurusan Rekomendasi: </span>
                                            <span className='font-bold underline'>{jurusan}</span>
                                        </p> */}
            </div>
            <button
              type="button"
              onClick={logoutFunc}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm"
            >
              <i className="fa-solid fa-right-from-bracket"></i> Keluar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startTest}
            className="border-2 border-gray-900 text-sm uppercase font-bold hover:bg-gray-900 hover:text-white px-3 py-1"
          >
            <span>Mulai</span>
          </button>
        )}
      </main>
    </section>
  );
}

export default Home;
