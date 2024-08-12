import axios from 'axios'
import Lottie from 'lottie-react'
import { jwtDecode } from 'jwt-decode'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LoadingScreen from './LoadingScreen'
import ServerError from './errors/ServerError'
import logoLp3i from '../assets/img/logo-lp3i.png'
import awanLp3i from '../assets/img/awan-lp3i.json'
import logoTagline from '../assets/img/tagline-warna.png'

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: 'Loading...'
  });

  const [errorPage, setErrorPage] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const getInfo = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('LP3ITGB:token');
      if (!token) {
        return navigate('/');
      }

      const decoded = jwtDecode(token);
      setUser(decoded.data);

      const fetchProfile = async (token) => {
        const response = await axios.get('https://api.politekniklp3i-tasikmalaya.ac.id/pmb/profiles/v1', {
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
          classes: profileData.applicant.class,
          status: decoded.data.status,
        };
        getResult(data);
      } catch (profileError) {
        if (profileError.response && profileError.response.status === 403) {
          try {
            const response = await axios.get('https://api.politekniklp3i-tasikmalaya.ac.id/pmb/auth/token/v2', {
              withCredentials: true,
            });

            const newToken = response.data;
            const decodedNewToken = jwtDecode(newToken);
            localStorage.setItem('LP3ITGB:token', newToken);
            setUser(decodedNewToken.data);
            const newProfileData = await fetchProfile(newToken);
            const data = {
              id: decodedNewToken.data.id,
              name: newProfileData.applicant.name,
              email: newProfileData.applicant.email,
              phone: newProfileData.applicant.phone,
              school: newProfileData.applicant.school,
              classes: newProfileData.applicant.class,
              status: decodedNewToken.data.status,
            };
            getResult(data);
          } catch (error) {
            console.error('Error refreshing token or fetching profile:', error);
            if (error.response && error.response.status === 400) {
              localStorage.removeItem('LP3ITGB:token');
              navigate('/')
            }
          }
        } else {
          console.error('Error fetching profile:', profileError);
          setErrorPage(true);
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
      .get(`https://api.politekniklp3i-tasikmalaya.ac.id/gayabelajar/hasils/${data.id}`)
      .then((response) => {
        setResult(response.data);
      })
      .catch((error) => {
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
        setLoading(false);
      });
  };

  const logoutHandle = async () => {
    const confirmed = confirm('Apakah anda yakin akan keluar?');
    if (confirmed) {
      try {
        const token = localStorage.getItem('LP3ITGB:token');
        const responseData = await axios.delete('https://api.politekniklp3i-tasikmalaya.ac.id/pmb/auth/logout/v2', {
          headers: {
            Authorization: token
          }
        });
        if (responseData) {
          alert(responseData.data.message);
          localStorage.removeItem('LP3ITGB:token');
          localStorage.removeItem("bucket");
          navigate('/')
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          try {
            const response = await axios.get('https://api.politekniklp3i-tasikmalaya.ac.id/pmb/auth/token/v2', {
              withCredentials: true,
            });

            const newToken = response.data;
            const responseData = await axios.delete('https://api.politekniklp3i-tasikmalaya.ac.id/pmb/auth/logout/v2', {
              headers: {
                Authorization: newToken
              }
            });
            if (responseData) {
              alert(responseData.data.message);
              localStorage.removeItem('LP3ITGB:token');
              localStorage.removeItem("bucket");
              navigate('/')
            }
          } catch (error) {
            console.error('Error refreshing token or fetching profile:', error);
            if (error.response && error.response.status === 400) {
              localStorage.removeItem('LP3ITGB:token');
              navigate('/')
            }
            if (error.response && error.response.status === 401) {
              localStorage.removeItem('LP3ITGB:token');
              navigate('/')
            }
          }
        } else {
          console.error('Error fetching profile:', error);
          setErrorPage(true);
        }
      }
    }
  }

  const startTest = async () => {
    setLoading(true);
    try {
      const responseUserExist = await axios.get(
        `https://api.politekniklp3i-tasikmalaya.ac.id/gayabelajar/users/${user.id}`
      );
      if (responseUserExist.data) {
        navigate("/question");
      } else {
        try {
          const token = localStorage.getItem('LP3ITGB:token');
          if (!token) {
            return navigate('/');
          }

          const decoded = jwtDecode(token);
          setUser(decoded.data);

          const fetchProfile = async (token) => {
            const response = await axios.get('https://api.politekniklp3i-tasikmalaya.ac.id/pmb/profiles/v1', {
              headers: { Authorization: token },
              withCredentials: true,
            });
            return response.data;
          };

          try {
            const profileData = await fetchProfile(token);
            const data = {
              id_user: decoded.data.id,
              name: profileData.applicant.name,
              email: profileData.applicant.email,
              phone: profileData.applicant.phone,
              school: profileData.applicant.school,
              classes: profileData.applicant.class,
              status: decoded.data.status,
            };
            const responseUser = await axios.post(`https://api.politekniklp3i-tasikmalaya.ac.id/gayabelajar/users`, data);
            if (responseUser) {
              setTimeout(() => {
                setLoading(false);
              }, 1000);
              navigate("/question");
            }
          } catch (profileError) {
            if (profileError.response && profileError.response.status === 403) {
              try {
                const response = await axios.get('https://api.politekniklp3i-tasikmalaya.ac.id/pmb/auth/token/v2', {
                  withCredentials: true,
                });

                const newToken = response.data;
                const decodedNewToken = jwtDecode(newToken);
                localStorage.setItem('LP3ITGB:token', newToken);
                setUser(decodedNewToken.data);
                const newProfileData = await fetchProfile(newToken);
                const data = {
                  id_user: decodedNewToken.data.id,
                  name: newProfileData.applicant.name,
                  email: newProfileData.applicant.email,
                  phone: newProfileData.applicant.phone,
                  school: newProfileData.applicant.school,
                  classes: newProfileData.applicant.class,
                  status: decodedNewToken.data.status,
                };
                const responseUser = await axios.post(`https://api.politekniklp3i-tasikmalaya.ac.id/gayabelajar/users`, data);
                if (responseUser) {
                  setTimeout(() => {
                    setLoading(false);
                  }, 1000);
                  navigate("/question");
                }
              } catch (error) {
                console.error('Error refreshing token or fetching profile:', error);
                if (error.response && error.response.status === 400) {
                  localStorage.removeItem('LP3ITGB:token');
                }
              }
            } else {
              console.error('Error fetching profile:', profileError);
              setErrorPage(true);
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
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getInfo();
  }, []);


  return (
    errorPage ? (
      <ServerError />
    ) : (
      loading ? (
        <LoadingScreen />
      ) : (
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
            {
              result ? (
                <div className="text-center space-y-3">
                  <div className="border-2 border-gray-900 text-base px-5 py-3">
                    <p>
                      <span>Nama Lengkap: </span>
                      <span className="font-bold underline">{result.nama}</span>
                    </p>
                    <p>
                      <span>Gaya Belajar Anda: </span>
                      <span className="font-bold underline">
                        <span>{result.hasil}</span>
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={logoutHandle}
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
              )
            }
          </main>
        </section>
      )
    )
  );
}

export default Home;
