import axios from 'axios'
import Lottie from 'lottie-react'
import { jwtDecode } from 'jwt-decode'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import questionImage from '../assets/img/awan-lp3i.json'
import backgroundImage from '../assets/img/background.png'

import LoadingScreen from './LoadingScreen'
import ServerError from './errors/ServerError'

const Result = () => {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const [errorPage, setErrorPage] = useState(false);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const getInfo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('LP3ITGB:token');
      if (!token) {
        return navigate('/');
      }

      const decoded = jwtDecode(token);
      const fetchProfile = async (token) => {
        const response = await axios.get('https://pmb-api.politekniklp3i-tasikmalaya.ac.id/profiles/v1', {
          headers: { Authorization: token },
          withCredentials: true,
        });
        return response.data;
      };

      try {
        const profileData = await fetchProfile(token);
        const data = {
          id: decoded.data.id,
          name: profileData.applicant.name,
          email: profileData.applicant.email,
          phone: profileData.applicant.phone,
          school: profileData.applicant.school,
          class: profileData.applicant.class,
          status: decoded.data.status,
        };
        setUser(data);
        getResult(data);
      } catch (profileError) {
        if (profileError.response && profileError.response.status === 403) {
          try {
            const response = await axios.get('https://pmb-api.politekniklp3i-tasikmalaya.ac.id/auth/token/v2', {
              withCredentials: true,
            });

            const newToken = response.data;
            const decodedNewToken = jwtDecode(newToken);
            localStorage.setItem('LP3ITGB:token', newToken);
            const newProfileData = await fetchProfile(newToken);
            const data = {
              id: decodedNewToken.data.id,
              name: newProfileData.applicant.name,
              email: newProfileData.applicant.email,
              phone: newProfileData.applicant.phone,
              school: newProfileData.applicant.school,
              class: newProfileData.applicant.class,
              status: decodedNewToken.data.status,
            };
            setUser(data);
            getResult(data);
          } catch (error) {
            console.error('Error refreshing token or fetching profile:', error);
            if (error.response && error.response.status === 400) {
              localStorage.removeItem('LP3ITGB:token');
              navigate('/');
            }
          }
        } else {
          console.error('Error fetching profile:', profileError);
          localStorage.removeItem('LP3ITGB:token');
          setErrorPage(true);
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      }
    } catch (error) {
      if (error.response) {
        if ([400, 403].includes(error.response.status)) {
          localStorage.removeItem('LP3ITGB:token');
          navigate('/');
        } else {
          console.error('Unexpected HTTP error:', error);
          setErrorPage(true);
        }
      } else if (error.request) {
        console.error('Network error:', error);
        setErrorPage(true);
      } else {
        console.error('Error:', error);
        setErrorPage(true);
      }
      navigate('/');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const getResult = async (data) => {
    await axios
      .get(
        `https://psikotest-gayabelajar-backend.politekniklp3i-tasikmalaya.ac.id/hasils/${data.id}`
      )
      .then((response) => {
        setResult(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const logoutHandle = async () => {
    const confirmed = confirm('Apakah anda yakin akan keluar?');
    if (confirmed) {
      try {
        const token = localStorage.getItem('LP3ITGB:token');
        if (!token) {
          console.log('Token tidak ditemukan saat logout');
          navigate('/login');
          return;
        }
        const responseData = await axios.delete('https://pmb-api.politekniklp3i-tasikmalaya.ac.id/auth/logout/v2', {
          headers: {
            Authorization: token
          }
        });
        if (responseData) {
          alert(responseData.data.message);
          localStorage.removeItem('LP3ITGB:token');
          localStorage.removeItem("LP3ITGB:bucket");
          navigate('/')
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          try {
            const response = await axios.get('https://pmb-api.politekniklp3i-tasikmalaya.ac.id/auth/token/v2', {
              withCredentials: true,
            });

            const newToken = response.data;
            const responseData = await axios.delete('https://pmb-api.politekniklp3i-tasikmalaya.ac.id/auth/logout/v2', {
              headers: {
                Authorization: newToken
              }
            });
            if (responseData) {
              alert(responseData.data.message);
              localStorage.removeItem('LP3ITGB:token');
              localStorage.removeItem("LP3ITGB:bucket");
              navigate('/')
            }
          } catch (error) {
            console.error('Error refreshing token or fetching profile:', error);
            if (error.response && error.response.status === 400) {
              localStorage.removeItem('LP3ITGB:token');
              navigate('/');
            }
            if (error.response && error.response.status === 401) {
              localStorage.removeItem('LP3ITGB:token');
              navigate('/');
            }
          }
        } else {
          console.error('Error fetching profile:', error);
          setErrorPage(true);
        }
      }
    }
  }

  useEffect(() => {
    getInfo();
  }, []);

  const mainStyle = {
    position: "relative",
    overflowX: "hidden",
    overflowY: "auto",
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
    errorPage ? (
      <ServerError />
    ) : (
      loading ? (
        <LoadingScreen />
      ) : (
        <main
          style={mainStyle}
          className="flex flex-col p-5 md:p-20 items-center justify-center h-screen"
        >
          <div style={backgroundImageStyle}></div>
          <div style={overlayStyle}></div>
          <Lottie animationData={questionImage} loop={true} className="h-40" />
          <div className="max-w-xl mx-auto bg-white shadow-xl p-4 text-center rounded-3xl">
            <div className="font-bold text-[30px] my-2">{user.name}</div>
            <hr className="border boreder-2 my-4 mx-4" />

            {result ? (
              <div className="text-2xl text-black uppercase font-bold" id="result">
                {result.hasil === "VISUAL" ? (
                  <div className="p-4 normal-case text-md text-sm text-slate-700">
                    Selamat, Gaya Belajar Kamu
                    <span className="text-red-500 font-extrabold uppercase pl-1">
                      VISUAL
                    </span>
                    .<br></br>
                    <br></br>Seseorang dengan gaya belajar{" "}
                    <span className="text-red-500 font-extrabold uppercase pl-1">
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
                ) : result.hasil === "AUDITORY" ? (
                  <div className="p-4 normal-case text-md text-sm text-slate-700">
                    Selamat, Gaya Belajar Kamu
                    <span className="text-red-500 font-extrabold uppercase pl-1">
                      AUDITORY
                    </span>
                    .<br></br>
                    <br></br>Seseorang dengan gaya belajar{" "}
                    <span className="text-red-500 font-extrabold uppercase pl-1">
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
                ) : result.hasil === "KINESTETIK" ? (
                  <div className="p-4 normal-case text-md text-sm text-slate-700">
                    Selamat, Gaya Belajar Kamu
                    <span className="text-red-500 font-extrabold uppercase pl-1">
                      KINESTETIK
                    </span>
                    .<br></br>
                    <br></br>Seseorang dengan gaya belajar{" "}
                    <span className="text-red-500 font-extrabold uppercase pl-1">
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
                ) : result.hasil === "VISUAL and AUDITORY" ? (
                  <div className="p-4 normal-case text-md text-sm text-slate-700">
                    Selamat, Gaya Belajar Kamu
                    <span className="text-red-500 font-extrabold uppercase pl-1">
                      VISUAL dan AUDITORY
                    </span>
                    .<br></br>
                    <br></br>Seseorang dengan gaya belajar{" "}
                    <span className="text-red-500 font-extrabold uppercase pl-1">
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
                    <span className="text-red-500 font-extrabold uppercase pl-1">
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
                ) : result.hasil === "VISUAL and KINESTETIK" ? (
                  <div className="p-4 normal-case text-md text-sm text-slate-700">
                    Selamat, Gaya Belajar Kamu
                    <span className="text-red-500 font-extrabold uppercase pl-1">
                      VISUAL dan KINESTETIK
                    </span>
                    .<br></br>
                    <br></br>Seseorang dengan gaya belajar{" "}
                    <span className="text-red-500 font-extrabold uppercase pl-1">
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
                    <span className="text-red-500 font-extrabold uppercase pl-1">
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
                ) : result.hasil === "AUDITORY and KINESTETIK" ? (
                  <div className="p-4 normal-case text-md text-sm text-slate-700">
                    Selamat, Gaya Belajar Kamu
                    <span className="text-red-500 font-extrabold uppercase pl-1">
                      AUDITORY dan KINESTETIK
                    </span>
                    .<br></br>
                    <br></br>Seseorang dengan gaya belajar{" "}
                    <span className="text-red-500 font-extrabold uppercase pl-1">
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
                    <span className="text-red-500 font-extrabold uppercase pl-1">
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
              onClick={logoutHandle}
              className="bg-sky-700 hover:bg-sky-800 text-white px-5 py-2 rounded-xl text-sm"
            >
              <i className="fa-solid fa-right-from-bracket"></i> Keluar
            </button>
          </div>
        </main>
      )
    )
  );
};

export default Result;
